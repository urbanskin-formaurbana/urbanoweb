# urbanoweb

FORMA Urbana customer-facing web app (React + Vite). This repo also serves as the orchestration root for the local development stack — it owns `docker-compose.yml` and `docker/mongo-restore/`, which wire the frontend, backend, and a locally-restored MongoDB into a single `docker compose up`.

## Related Repositories

- `urbanoweb` — this repo. React/Vite frontend + infra orchestration.
- `urbanoweb_backend` — FastAPI backend (sibling repo, expected at `../urbanoweb_backend`). Required by the local dev stack: the backend image is built from this sibling path, and HTTPS certs (`localhost+1.pem`, `localhost+1-key.pem`) are mounted from there.

## Tech Stack

React 19, Vite, MUI, react-router-dom, @react-oauth/google, @mercadopago/sdk-react, Tiptap (rich text), Sentry. Node >= 20.

## Local Development

Two ways to run locally, depending on what you're working on.

### Full stack (frontend + backend + Mongo seeded from prod backup)

Recommended when working across the frontend / backend boundary.

Prerequisites:
- Docker running (Docker Desktop, Rancher Desktop, or Colima).
- The sibling repo `urbanoweb_backend` cloned at `../urbanoweb_backend`.
- mkcert-generated certs (`localhost+1.pem`, `localhost+1-key.pem`) present in the backend repo root.
- AWS credentials at `~/.aws/credentials` with profiles that can read the backups bucket. See OPERATIONS.md.
- A `.env` file at the repo root (copy from `.env.example` and fill values).

```bash
docker compose up
```

This brings up:
- `web` — Vite dev server on https://localhost:5173 (HTTPS via mkcert certs).
- `backend` — FastAPI on http://localhost:8000 / https://localhost:8443.
- `mongo` — MongoDB 7 on 127.0.0.1:27017.
- `mongo-restore` — one-shot init container that pulls the latest backup from S3 and restores it into `mongo`. Idempotent (skips if the latest backup is already loaded).

The frontend (in the browser at https://localhost:5173) talks to the backend at https://localhost:8443/api/v1.

### Frontend only (Vite dev server, no Docker)

If you're only working on the UI and have a backend running elsewhere:

```bash
npm install
npm run dev
```

Set `VITE_API_URL` in `.env.local` to whichever backend you want to hit.

## Project Structure

```
src/                   # React app source
api/                   # Vercel serverless functions (currently: health endpoint)
public/                # Static assets
docker/
  mongo-restore/       # Init-container image: pulls latest S3 backup, restores into mongo
docker-compose.yml     # Local dev stack
Dockerfile             # Dev Dockerfile for the Vite container (production build is handled by Vercel)
vercel.json            # Vercel SPA rewrite + build config
.env.example           # Frontend env vars template
```

## Scripts

- `npm run dev` — Vite dev server.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve the production build locally.
- `npm run lint` — ESLint.

## Documentation

For deployment, hosting, infrastructure, backups, and operational runbooks, see [OPERATIONS.md](OPERATIONS.md).
