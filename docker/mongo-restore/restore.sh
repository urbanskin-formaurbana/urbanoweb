#!/usr/bin/env bash
# Smart-refresh restore of the latest Coolify mongo backup from S3 into the
# `mongo` service. A marker file in the persistent `mongo_restore_state` volume
# stores the S3 ETag of the last restored object; on each run we compare the
# latest object's ETag against the marker and skip the restore when they match.
#
# Source DB is `urbano_db` (post Atlas → Coolify migration; app user is
# `urbano_app`, scoped readWrite on urbano_db). Historical backups taken before
# the migration used `default` — to restore one of those, override the default
# with `SOURCE_DB=default docker compose up`.
#
# WARNING: mongorestore runs with --drop, so every refresh wipes the local
# `urbanoweb` DB and replaces it with the latest backup contents. Local-only
# test data will NOT survive a refresh — by design, local dev mirrors prod.

set -euo pipefail

: "${BACKUP_BUCKET:?BACKUP_BUCKET env var is required}"
: "${BACKUP_PREFIX:?BACKUP_PREFIX env var is required}"
MONGO_HOST="${MONGO_HOST:-mongo}"
MONGO_PORT="${MONGO_PORT:-27017}"
TARGET_DB="${TARGET_DB:-urbanoweb}"
SOURCE_DB="${SOURCE_DB:-urbano_db}"

STATE_DIR=/state
MARKER="$STATE_DIR/restore.done"
WORK_DIR=/tmp/mongo-restore

mkdir -p "$STATE_DIR"

echo "🔍 Locating latest backup in s3://${BACKUP_BUCKET}/${BACKUP_PREFIX}"
LATEST_KEY=$(aws s3api list-objects-v2 \
    --bucket "$BACKUP_BUCKET" \
    --prefix "$BACKUP_PREFIX" \
    --query 'sort_by(Contents, &LastModified)[-1].Key' \
    --output text)

if [ -z "${LATEST_KEY:-}" ] || [ "$LATEST_KEY" = "None" ]; then
    echo "❌ No backups found under s3://${BACKUP_BUCKET}/${BACKUP_PREFIX}" >&2
    exit 1
fi

LATEST_ETAG=$(aws s3api head-object \
    --bucket "$BACKUP_BUCKET" \
    --key "$LATEST_KEY" \
    --query ETag \
    --output text \
    | tr -d '"')

if [ -f "$MARKER" ] && [ "$(cat "$MARKER")" = "$LATEST_ETAG" ]; then
    echo "✅ Latest backup already restored (etag=${LATEST_ETAG}), skipping."
    exit 0
fi

rm -rf "$WORK_DIR"
mkdir -p "$WORK_DIR"
cd "$WORK_DIR"

BACKUP_FILE="$WORK_DIR/backup.archive.gz"
echo "⬇️  Downloading s3://${BACKUP_BUCKET}/${LATEST_KEY} (etag=${LATEST_ETAG})"
aws s3 cp "s3://${BACKUP_BUCKET}/${LATEST_KEY}" "$BACKUP_FILE"

# Despite the .tar.gz extension, Coolify's mongo-dump-all-*.tar.gz files are
# mongodump --archive --gzip single-stream archives (verified via magic bytes:
# the gunzipped stream starts with the mongodump archive header, not a tar
# header). So we feed the file directly to mongorestore — no tar extraction.
echo "🍃 Restoring archive → '${TARGET_DB}' on ${MONGO_HOST}:${MONGO_PORT} (remap ${SOURCE_DB}.* → ${TARGET_DB}.*)"
mongorestore \
    --uri="mongodb://${MONGO_HOST}:${MONGO_PORT}" \
    --archive="$BACKUP_FILE" \
    --gzip \
    --nsInclude="${SOURCE_DB}.*" \
    --nsFrom="${SOURCE_DB}.*" \
    --nsTo="${TARGET_DB}.*" \
    --drop

printf '%s' "$LATEST_ETAG" > "$MARKER"
rm -rf "$WORK_DIR"
echo "✅ Restore complete (key: ${LATEST_KEY}, etag: ${LATEST_ETAG}). Marker updated at ${MARKER}."
