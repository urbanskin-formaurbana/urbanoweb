#!/usr/bin/env bash
# Smart-refresh restore of the latest Coolify SuperTokens Postgres backup from
# S3 into the `supertokens-postgres` service. A marker file in the persistent
# `supertokens_postgres_restore_state` volume stores the S3 ETag of the last
# restored object; on each run we compare the latest object's ETag against the
# marker and skip the restore when they match.
#
# The source dump is a gzipped `pg_dumpall` plain-SQL file (PostgreSQL 17)
# targeting the default `postgres` cluster DB — all tables in the `public`
# schema, no CREATE DATABASE. Before replay we strip the dump's
# `CREATE ROLE postgres; / ALTER ROLE postgres WITH ... PASSWORD '<prod-hash>'`
# block so the local `postgres` role keeps the dev password set by
# POSTGRES_PASSWORD at init time (we don't have the prod plaintext, so replaying
# the prod SCRAM hash would lock us — and the SuperTokens core — out).
#
# WARNING: this drops and recreates the `public` schema of the target DB on
# every refresh — local-only test data will NOT survive. By design: local dev
# mirrors prod.

set -euo pipefail

: "${BACKUP_BUCKET:?BACKUP_BUCKET env var is required}"
: "${BACKUP_PREFIX:?BACKUP_PREFIX env var is required}"
PG_HOST="${PG_HOST:-supertokens-postgres}"
PG_PORT="${PG_PORT:-5432}"
PG_SUPERUSER="${PG_SUPERUSER:-postgres}"
PG_SUPERUSER_PASSWORD="${PG_SUPERUSER_PASSWORD:-supertokens_local_dev}"
PG_TARGET_DB="${PG_TARGET_DB:-postgres}"
MARKER_FILE="${MARKER_FILE:-/state/restore.marker}"

MIN_TABLES=40
BACKUP_TMP=/tmp/backup.gz
RESTORE_LOG=/tmp/restore.log

mkdir -p "$(dirname "${MARKER_FILE}")"

echo "🔍 Locating latest backup in s3://${BACKUP_BUCKET}/${BACKUP_PREFIX}"
LATEST_KEY="$(aws s3api list-objects-v2 \
    --bucket "${BACKUP_BUCKET}" \
    --prefix "${BACKUP_PREFIX}" \
    --query 'sort_by(Contents, &LastModified)[-1].Key' \
    --output text)"

if [ -z "${LATEST_KEY:-}" ] || [ "${LATEST_KEY}" = "None" ]; then
    echo "❌ No backups found under s3://${BACKUP_BUCKET}/${BACKUP_PREFIX}" >&2
    exit 1
fi

LATEST_ETAG="$(aws s3api head-object \
    --bucket "${BACKUP_BUCKET}" \
    --key "${LATEST_KEY}" \
    --query ETag \
    --output text \
    | tr -d '"')"

if [ -f "${MARKER_FILE}" ] && [ "$(cat "${MARKER_FILE}")" = "${LATEST_ETAG}" ]; then
    echo "✅ Already restored at ETag ${LATEST_ETAG}. Skipping."
    exit 0
fi

if [ -f "${MARKER_FILE}" ]; then
    echo "♻️  ETag changed: $(cat "${MARKER_FILE}") → ${LATEST_ETAG} — refreshing."
fi

echo "⬇️  Downloading s3://${BACKUP_BUCKET}/${LATEST_KEY} (etag=${LATEST_ETAG})"
aws s3 cp "s3://${BACKUP_BUCKET}/${LATEST_KEY}" "${BACKUP_TMP}"

echo "⏳ Waiting for Postgres at ${PG_HOST}:${PG_PORT} to accept connections"
pg_ready=0
for _ in $(seq 1 60); do
    if pg_isready -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_SUPERUSER}" -d "${PG_TARGET_DB}" >/dev/null 2>&1; then
        pg_ready=1
        break
    fi
    sleep 1
done
if [ "${pg_ready}" -ne 1 ]; then
    echo "❌ Postgres at ${PG_HOST}:${PG_PORT} never became ready after 60s" >&2
    exit 1
fi

run_psql() {
    PGPASSWORD="${PG_SUPERUSER_PASSWORD}" psql \
        -h "${PG_HOST}" -p "${PG_PORT}" -U "${PG_SUPERUSER}" -d "${PG_TARGET_DB}" \
        "$@"
}

echo "🧹 Terminating other connections to '${PG_TARGET_DB}'"
run_psql -v ON_ERROR_STOP=1 \
    -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();" \
    >/dev/null

echo "🧨 Resetting 'public' schema in '${PG_TARGET_DB}'"
run_psql -v ON_ERROR_STOP=1 \
    -c "DROP SCHEMA IF EXISTS public CASCADE;" \
    -c "CREATE SCHEMA public;" \
    -c "GRANT ALL ON SCHEMA public TO ${PG_SUPERUSER};" \
    -c "GRANT ALL ON SCHEMA public TO public;" \
    >/dev/null

# Strip the dump's `CREATE ROLE postgres;` line and the immediately-following
# `ALTER ROLE postgres WITH ... PASSWORD '<prod-hash>';` line so the local
# `postgres` role keeps the password set at container init time.
strip_postgres_role() {
    awk '
        /^CREATE ROLE postgres;/        { skip = 1; next }
        skip && /^ALTER ROLE postgres / { next }
        skip && /^$/                    { skip = 0; next }
        skip && /^--/                   { skip = 0 }
        { print }
    '
}

echo "🔎 Self-testing the stream edit"
ORIG_TABLES="$(gunzip -c "${BACKUP_TMP}" | grep -c '^CREATE TABLE ' || true)"
EDITED_TABLES="$(gunzip -c "${BACKUP_TMP}" | strip_postgres_role | grep -c '^CREATE TABLE ' || true)"
echo "   CREATE TABLE count — original: ${ORIG_TABLES}, after stream edit: ${EDITED_TABLES}"
if [ -z "${EDITED_TABLES}" ] || [ "${EDITED_TABLES}" -lt "${MIN_TABLES}" ] || [ "${EDITED_TABLES}" != "${ORIG_TABLES}" ]; then
    echo "❌ Stream edit broke the dump (expected ≥ ${MIN_TABLES} CREATE TABLE statements, unchanged from the original)" >&2
    [ -f "${RESTORE_LOG}" ] && tail -n 50 "${RESTORE_LOG}" >&2 || true
    exit 1
fi

echo "🐘 Replaying dump into '${PG_TARGET_DB}' on ${PG_HOST}:${PG_PORT}"
# ON_ERROR_STOP=0: the dump's residual `CREATE ROLE` / template-DB lines fail
# benignly. We validate success below by counting restored tables.
set +e
gunzip -c "${BACKUP_TMP}" | strip_postgres_role | run_psql -v ON_ERROR_STOP=0 > "${RESTORE_LOG}" 2>&1
psql_status=$?
set -e
if [ "${psql_status}" -ne 0 ]; then
    echo "⚠️  psql pipeline exited with status ${psql_status} (continuing — ON_ERROR_STOP=0; see ${RESTORE_LOG})"
fi

echo "🔢 Verifying restored schema in '${PG_TARGET_DB}'"
TABLE_COUNT="$(run_psql -v ON_ERROR_STOP=1 -tAc "SELECT count(*) FROM pg_tables WHERE schemaname = 'public';" | tr -d '[:space:]')"
echo "   public schema table count: ${TABLE_COUNT}"
if [ -z "${TABLE_COUNT}" ] || [ "${TABLE_COUNT}" -lt "${MIN_TABLES}" ]; then
    echo "❌ Restore verification failed: expected ≥ ${MIN_TABLES} tables in public, got '${TABLE_COUNT}'" >&2
    echo "---- tail of ${RESTORE_LOG} ----" >&2
    tail -n 80 "${RESTORE_LOG}" >&2 || true
    exit 1
fi

printf '%s' "${LATEST_ETAG}" > "${MARKER_FILE}"
rm -f "${BACKUP_TMP}"
echo "✅ Restore complete. key=${LATEST_KEY}, etag=${LATEST_ETAG}, tables=${TABLE_COUNT}. Marker updated at ${MARKER_FILE}."
