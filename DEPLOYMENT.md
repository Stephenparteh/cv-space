# Deployment Guide

Resume Builder V2 is two independently deployable pieces:

| Part | Stack | Deploy as |
| --- | --- | --- |
| `backend/` | Node + Express + Mongoose | a long-running Node process |
| `frontend/` | React + Vite (static build) | static files on any static host / CDN |

The database is **MongoDB Atlas** and stays as-is — the backend only needs its
connection string.

---

## 1. Backend

### Build & start

```bash
cd backend
npm ci
npm run build      # tsc -> dist/
npm start          # node dist/server.js
```

- Node 18+ (uses the global `fetch`; project developed on Node 20).
- `npm start` runs `dist/server.js`, so `npm run build` must run first.
- The process listens on `PORT` (default `5000`). It stays in the foreground —
  run it under the platform's process manager (systemd, PM2, a container, or the
  host's built-in supervisor).
- On boot it connects to MongoDB first; if that fails it logs a sanitized error
  and exits non-zero (no connection string is printed).

### Required environment variables

Set these in the host's environment (see `backend/.env.example`):

| Name | Required | Notes |
| --- | --- | --- |
| `MONGODB_URI` | **yes** | MongoDB Atlas `mongodb+srv://` connection string. |
| `JWT_SECRET` | **yes** | Long random string used to sign auth tokens. |
| `NODE_ENV` | recommended | Set to `production`. Suppresses internal error detail in API responses. |
| `PORT` | no | Defaults to `5000`. Many hosts inject this automatically. |
| `JWT_EXPIRES_IN` | no | Token lifetime, `ms`/`zeit` format. Defaults to `7d`. |
| `CORS_ORIGIN` | recommended | Comma-separated list of allowed browser origins (the frontend's URL[s]). Unset or `*` allows any origin. |
| `JSON_BODY_LIMIT` | no | Max JSON request body. Defaults to `1mb` (profile photos are inlined as data URLs). |

The server throws on startup if `MONGODB_URI` or `JWT_SECRET` is missing.

### CORS

The API is called cross-origin by the static frontend, so `CORS_ORIGIN` must
include the frontend's deployed origin(s), e.g.:

```
CORS_ORIGIN=https://resume-builder.example.com,https://www.resume-builder.example.com
```

With `CORS_ORIGIN` unset or `*`, all origins are allowed — acceptable for a
public read API and local dev, but pin it in production.

### Health check

`GET /api/health` → `200` with `{ success: true, status: "ok", database: { status } }`.
No auth. Use it as the platform's liveness/readiness probe.

---

## 2. Frontend

### Build

```bash
cd frontend
npm ci
npm run build      # -> dist/
```

Serve the contents of `frontend/dist/` as static files. `npm run preview` serves
that build locally for a final smoke test.

### Environment variables

Vite inlines these at **build time**, so they must be set in the build
environment, not at runtime (see `frontend/.env.example`):

| Name | Required | Notes |
| --- | --- | --- |
| `VITE_API_BASE_URL` | recommended | Base URL of the deployed backend, no trailing slash (e.g. `https://api.resume-builder.example.com`). Defaults to `http://localhost:5000` when unset. |

### SPA routing (history fallback)

The app uses client-side routing (`/dashboard`, `/resumes/:id/edit`, `/r/:slug`,
…). The static host must rewrite unknown paths to `/index.html` with a `200`, or
deep links and refreshes will 404.

- **Netlify / Cloudflare Pages / similar:** `frontend/public/_redirects` is
  included (`/*  /index.html  200`) and ends up in `dist/`.
- **Vercel:** add a rewrite of `/(.*)` → `/index.html`.
- **nginx:** `try_files $uri $uri/ /index.html;`
- **Apache:** `FallbackResource /index.html`
- **`vite preview` / static file server:** use its SPA / history-fallback flag.

Static assets under `dist/assets/` are content-hashed and safe to cache
aggressively; serve `index.html` with `Cache-Control: no-cache`.

---

## 3. Deployment order

1. Deploy the backend; confirm `GET /api/health` returns `200` with
   `database.status === "connected"`.
2. Build the frontend with `VITE_API_BASE_URL` pointing at that backend.
3. Deploy the frontend static build.
4. Set `CORS_ORIGIN` on the backend to the frontend's final origin and restart.
5. Smoke test: register, create a resume, publish it, open `/r/<slug>` in a
   logged-out browser, download the PDF.
