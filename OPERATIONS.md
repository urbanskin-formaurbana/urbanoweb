# Operations

Operational reference for urbanoweb in production and for running the local dev stack. For getting started locally, see [README.md](README.md).

## Production Hosting (Frontend)

- **Platform:** Vercel.
- **Production domain:** `formaurbana.skin` (apex). Also reachable at `urbanoweb.vercel.app`.
- **Deploy trigger:** Push to `main` auto-deploys to Production. PRs auto-deploy as Preview environments.
- **Build config:** `vercel.json` at repo root — `npm run build` → `dist/`, with SPA fallback rewriting all routes to `/index.html`.
- **Health endpoint:** `GET /api/health` (Vercel serverless function at `api/health.js`) — returns deploy metadata: `env`, `branch`, `commit`, `deployedAt`. Useful for confirming which commit is currently live.

### Environment Variables (Vercel)

All four are scoped to Production + Preview + Development:

- `VITE_API_URL` — backend API base, including `/api/v1` suffix. Production: `https://api.formaurbana.skin/api/v1`.
- `VITE_GOOGLE_CLIENT_ID` — Google OAuth web client ID.
- `VITE_MERCADOPAGO_PUBLIC_KEY` — MercadoPago checkout public key (`TEST-` prefix for sandbox, `APP_USR-` for live).
- `VITE_REPO_URL` — declared but not consumed by app code; flagged for cleanup.

**Vite build-time quirk:** `VITE_*` variables are baked into the JS bundle at build time, not read at runtime. Changing a value in Vercel Project Settings does NOT update existing deployments. To pick up a new value, trigger a new deployment (push, or "Redeploy" in the Vercel UI).

## Authentication: Google OAuth

Authorized JavaScript origins on the OAuth client (Google Cloud Console):
- `https://formaurbana.skin`
- `https://urbanoweb.vercel.app`
- `https://localhost:5173`

Adding a new domain (e.g., a custom Preview domain) requires updating the OAuth client.

## Payments: MercadoPago

The frontend uses `@mercadopago/sdk-react` with the public key from `VITE_MERCADOPAGO_PUBLIC_KEY`. Sandbox vs live is determined by the key prefix:
- `TEST-...` → sandbox.
- `APP_USR-...` → live.

Webhook handling lives in `urbanoweb_backend`, not in this repo.

## Local Development Stack

Defined in `docker-compose.yml`. Four services:

### `web` (frontend)
Vite dev server, port 5173, HTTPS via mkcert certs mounted from `../urbanoweb_backend/`. Hot reload via Chokidar polling. `VITE_API_URL` is overridden in compose to `https://localhost:8443/api/v1` (the local backend's HTTPS port).

### `backend` (FastAPI)
Built from `../urbanoweb_backend/Dockerfile` (development target). Ports 8000 (HTTP) and 8443 (HTTPS). Reads its `.env` from the backend repo. `MONGODB_URL` is overridden in compose to `mongodb://mongo:27017/urbanoweb` so dev hits the local mongo (not Atlas/Coolify).

### `mongo`
MongoDB 7. Bound only to `127.0.0.1:27017`. Persistent data in the `mongo_data` volume.

### `mongo-restore` (one-shot init container)
Built from `docker/mongo-restore/`. On every `docker compose up`:

1. Lists the bucket prefix in S3, finds the latest backup by `LastModified`.
2. Compares that object's ETag against the marker file in the `mongo_restore_state` volume.
3. ETag matches → exits 0 (skip).
4. ETag differs → downloads and runs `mongorestore --archive --gzip --drop` with namespace remapping `urbano_db.* → urbanoweb.*`, then writes the new ETag to the marker.

To force a refresh: `docker volume rm urbanoweb_mongo_restore_state` then `docker compose up`.

The script lives in `docker/mongo-restore/restore.sh`. The image bundles `mongorestore` (from `mongo:7`) and AWS CLI v2.

**`--drop` semantics:** every refresh wipes the local `urbanoweb` DB and replaces it with the latest production backup. Local-only test data does NOT survive a refresh. By design — local dev mirrors prod.

**Restoring a pre-migration backup:** historical archives (from the Atlas era) used source DB `default` instead of `urbano_db`. To restore one, override the source DB: `SOURCE_DB=default docker compose up`.

### Cross-repo dependency

The compose stack mounts files from `../urbanoweb_backend`:
- Backend Dockerfile build context.
- HTTPS certs (`localhost+1.pem`, `localhost+1-key.pem`) for both `web` and `backend`.

Running `docker compose up` requires the sibling repo present at `../urbanoweb_backend`.

## Backups (Source for Local Restore)

The local `mongo-restore` container reads from the same S3 bucket that production Coolify backups are written to. See `urbanoweb_backend/OPERATIONS.md` for the full backup pipeline (bucket, prefix, IAM, archive format).

## Migrations Runner (Backend, Local Dev Context)

The local backend service runs S3-backed migrations from a separate prefix:
- Bucket: `urbano-mongo-backups-gosjoseph` (same bucket as backups).
- Prefix: `migrations-dev/` (isolated from the backups prefix).
- AWS profile: `urbano-migrations-dev`.

Note the AWS profile divergence: `mongo-restore` uses profile `default`, the backend's migration runner uses `urbano-migrations-dev`. Both must exist in `~/.aws/credentials` for `docker compose up` to work end-to-end.

## Known Drift / TODOs

- **Local DB name vs prod DB name:** local stack uses DB `urbanoweb` (compose `MONGODB_URL` and `restore.sh` `TARGET_DB`); production (Coolify) uses `urbano_db`. Functional today because the app reads the DB name from `MONGODB_URL`, but it's needless divergence. Consider aligning local to `urbano_db`.
- **`VITE_REPO_URL`** is declared in `.env.example` and Vercel but not consumed by app code. Consider removing.
