# Resume Builder V2

Clean rebuild of the Resume Builder MVP described in [`PROJECT_PLAN.md`](./PROJECT_PLAN.md). The legacy
implementation (`../resume-builder_old/backend` and `../resume-builder_old/frontend`) is kept as
reference only and is not modified or reused beyond a few Tailwind/shadcn UI foundations.

**Status**: foundation milestone only. No auth, resume editor, PDF export, or sharing yet — see
"What's here" below.

## Architecture

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + shadcn/ui + React Router — `frontend/`
- **Backend**: Node.js + Express + TypeScript (REST API) — `backend/`
- **Database**: MongoDB Atlas + Mongoose
- **Auth** (later milestone): JWT + bcrypt
- **PDF export** (later milestone): Puppeteer

## What's here

- A working Vite/React/Tailwind/shadcn frontend with a router and one landing page that live-checks
  the backend via `GET /api/health`.
- A working Express + TypeScript backend with a clean `config/controllers/middleware/models/routes/services`
  structure, centralized error handling, and a Mongoose connection module that fails gracefully
  (logs a clear warning) instead of crashing when `MONGODB_URI` is missing or invalid.
- `GET /api/health` — returns server status, uptime, and current database connection state.

## Requirements

- Node.js 20+ and npm

## Install

```sh
cd frontend && npm install
cd ../backend && npm install
```

## Run

Backend (from `backend/`):

```sh
npm run dev
```

Runs on `http://localhost:5000` by default. Health check: `http://localhost:5000/api/health`.

Frontend (from `frontend/`):

```sh
npm run dev
```

Runs on `http://localhost:5173`. The landing page calls the backend health endpoint and shows
whether the server and database are reachable.

## Environment variables

Copy each `.env.example` to `.env` and fill in real values — do not commit `.env`.

**`backend/.env`**

```
MONGODB_URI=       # your MongoDB Atlas connection string
JWT_SECRET=        # a new, random secret (not yet used by any route in this milestone)
PORT=5000
```

**`frontend/.env`**

```
VITE_API_BASE_URL=http://localhost:5000
```

Without `MONGODB_URI` set, the backend still starts and `/api/health` still responds — it just
reports `database.status: "not_configured"`.

## Verifying the health endpoint

```sh
curl http://localhost:5000/api/health
```

Expected shape:

```json
{
  "success": true,
  "status": "ok",
  "uptimeSeconds": 12,
  "timestamp": "...",
  "database": { "status": "connected", "error": null }
}
```
