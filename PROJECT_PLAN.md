# Resume Builder V2 — Project Plan

**Repository:** `resume-builder-v2`
**Document:** `PROJECT_PLAN.md`
**Last Updated:** September 2026
**Status:** Milestones 1–7 complete and deployed (Vercel + Render + Atlas).
Milestone 8 (Guest Builder, Account Transfer & Admin Dashboard) implemented;
DB-backed re-verification and deployment are pending an Atlas connectivity
check — see Milestone 8 below.

> **Roadmap note:** the plan was consolidated to 6 milestones, then split again
> so M6 is **Resume Builder Expansion** and M7 is **PDF, QA & Production**
> (see section 37). M1–M6 are complete and verified.

---

# 1. SUMMARY

Resume Builder V2 is a free, mobile-first web application that allows users to create professional resumes without paying to create or download them.

The application follows the core philosophy:

> **Create first. Account later.**

A guest should be able to create and download a professional resume without creating an account.

A registered user should additionally be able to save, manage, duplicate, and share resumes.

The long-term vision is to expand the application into a freelancer directory where users can voluntarily make their professional profiles public and discoverable by people looking to hire freelancers.

**Important:** The freelancer directory is NOT part of the MVP.

---

# 2. PROJECT SCOPE

## MVP Goal

The MVP must allow:

### Guest users

- Create a resume without an account
- Enter professional information
- Add personal information
- Add a professional summary
- Add work experience
- Add education
- Add skills
- Select a resume template
- See a live resume preview
- Switch between templates
- Download the finished resume as a PDF

### Registered users

Registered users can do everything a guest can do, plus:

- Create an account
- Log in
- Log out
- Save resumes
- View saved resumes
- Edit saved resumes
- Delete saved resumes
- Duplicate resumes
- Create multiple resumes
- Access a dashboard
- Generate shareable resume links

---

# 3. CORE USER JOURNEY

## Guest

```text
Open App
    ↓
Create Resume
    ↓
Fill Information
    ↓
Live Preview
    ↓
Choose Template
    ↓
Customize
    ↓
Export PDF
```

## Registered User

```text
Create
    ↓
Preview
    ↓
Customize
    ↓
Export
    ↓
Save
    ↓
Manage
    ↓
Share
```

---

# 4. USER TYPES

## Guest User

A guest user does not need an account to create or download a resume.

Guest capabilities:

- Create resume
- Edit resume
- Preview resume
- Select template
- Switch templates
- Download PDF

Guest resume data may initially exist only in frontend/client state.

Account creation should not be required simply to create or download a resume.

---

## Registered User

A registered user can:

- Create resumes
- Save resumes
- Edit saved resumes
- Delete resumes
- Duplicate resumes
- Create multiple resumes
- View saved resumes
- Access dashboard
- Generate shareable links
- Access saved resumes from different sessions

Authentication is required for saved-resume functionality.

---

# 5. RESUME SECTIONS

The MVP resume data model contains:

1. Personal Information
2. Professional Summary
3. Work Experience
4. Education
5. Skills

The data model should remain reusable and structured so that the same resume data can be consumed by:

- The editor
- Live preview
- Resume templates
- PDF generation
- Saved resumes
- Shared resumes

---

# 6. RESUME TEMPLATES

The MVP will contain three initial templates:

1. Classic
2. Modern
3. Minimal

Template architecture:

```text
Resume Data
     ↓
Template Renderer
     ↓
 ┌─────────┬─────────┬─────────┐
 │ Classic │ Modern  │ Minimal │
 └─────────┴─────────┴─────────┘
```

Templates must consume the same standardized resume data structure.

Templates should not contain business logic for storing or managing resumes.

---

# 7. LIVE PREVIEW

The resume preview must update automatically as the user edits the resume.

Requirements:

- Real-time updates
- Template switching without losing data
- Mobile-friendly preview
- Desktop-friendly preview
- Consistent resume data across templates
- Preview should closely match the eventual PDF output

The preview should be treated as a renderer of resume data rather than a separate source of truth.

---

# 8. PDF EXPORT

The final PDF must:

- Match the selected resume template
- Closely match the live preview
- Contain selectable text
- Support multiple pages
- Have professional spacing
- Print correctly
- Maintain proper page breaks
- Work reliably on desktop and mobile workflows where technically supported

Potential technologies include:

- Puppeteer
- React-PDF
- Another justified PDF solution

The final PDF technology has not yet been locked.

The implementation must choose a solution based on the application's actual rendering requirements rather than introducing a technology without justification.

---

# 9. CURRENT TECHNICAL STACK

The actual V2 architecture is now locked as follows.

## Frontend

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
React Router
Lucide React
```

## Backend

```text
Node.js
Express.js
TypeScript
tsx
```

## Database

```text
MongoDB Atlas
Mongoose
```

## Authentication

```text
JWT
bcryptjs
Bearer-token authentication
```

## Development / Testing Tools

```text
VS Code
Git
GitHub
Postman
```

Potential testing technologies:

```text
Vitest
React Testing Library
Supertest
Playwright
```

Testing tools may be introduced when appropriate for the relevant milestone.

---

# 10. LOCKED ARCHITECTURE DECISIONS

The following decisions are now considered locked unless explicitly changed through an architecture decision.

### Frontend

```text
React + TypeScript + Vite
```

### Styling

```text
Tailwind CSS
shadcn/ui
```

### Backend

```text
Node.js + Express.js + TypeScript
```

### Database

```text
MongoDB Atlas
```

### ODM

```text
Mongoose
```

### Authentication

```text
JWT
bcryptjs
```

### API architecture

```text
REST API
```

### Database architecture

```text
Frontend
    ↓
REST API
    ↓
Express Backend
    ↓
Controllers / Services
    ↓
Mongoose
    ↓
MongoDB Atlas
```

---

# 11. IMPORTANT ARCHITECTURE NOTE

An older version of this project plan proposed:

```text
SQLite
Prisma
```

That architecture is no longer used.

The actual V2 architecture is:

```text
MongoDB Atlas
Mongoose
```

Do NOT migrate the project back to SQLite or Prisma unless an explicit architecture decision is made.

Do NOT replace MongoDB Atlas with another database without approval.

Do NOT replace Mongoose without approval.

---

# 12. FRONTEND / BACKEND SEPARATION

The application follows separation of concerns:

```text
Frontend
   ↓
REST API
   ↓
Backend
   ↓
Database
```

Frontend responsibilities include:

- User interface
- Form interaction
- Client-side validation
- Resume editing
- Live preview
- Template selection
- API communication

Backend responsibilities include:

- Authentication
- Authorization
- Backend validation
- Resume persistence
- Resume ownership
- Data isolation
- API responses
- Security

Database responsibilities include:

- Persistent storage
- User records
- Resume records
- Resume ownership data

The frontend must never be treated as the source of truth for security or authorization.

---

# 13. CURRENT PROJECT STRUCTURE

Current V2 structure is approximately:

```text
resume-builder-v2/
│
├── PROJECT_PLAN.md
├── README.md
│
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   │
│   │   ├── layouts/
│   │   │   └── MainLayout.tsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── button.tsx
│   │   │       └── card.tsx
│   │   │
│   │   ├── services/
│   │   │   └── api.ts
│   │   │
│   │   └── lib/
│   │       └── utils.ts
│   │
│   └── ...
│
└── backend/
    ├── src/
    │   ├── config/
    │   │   ├── env.ts
    │   │   └── db.ts
    │   │
    │   ├── controllers/
    │   │   ├── health.controller.ts
    │   │   └── auth.controller.ts
    │   │
    │   ├── middleware/
    │   │   ├── errorHandler.ts
    │   │   └── auth.ts
    │   │
    │   ├── models/
    │   │   └── User.ts
    │   │
    │   ├── routes/
    │   │   ├── health.routes.ts
    │   │   └── auth.routes.ts
    │   │
    │   ├── utils/
    │   │   ├── jwt.ts
    │   │   ├── validators.ts
    │   │   └── asyncHandler.ts
    │   │
    │   ├── types/
    │   │   └── express.d.ts
    │   │
    │   ├── app.ts
    │   └── server.ts
    │
    └── ...
```

This structure may evolve as the project grows, but changes should remain justified and minimal.

---

# 14. DATABASE

MongoDB Atlas is the application's current database.

Current configured database:

```text
resume_builder
```

MongoDB Atlas cluster:

```text
ResumeBuilder
```

The backend connects through Mongoose.

## Security

Database credentials must remain in environment variables.

`.env` files must not be committed to Git.

Never expose:

- MongoDB URI
- MongoDB username
- MongoDB password
- JWT secret
- JWT tokens unnecessarily

---

# 15. USER MODEL

The current User model contains:

```text
name
email
password
createdAt
updatedAt
```

Email requirements:

- Unique
- Lowercase
- Trimmed

Password requirements:

- Minimum 8 characters
- bcrypt hashed
- 10 salt rounds
- Stored as a hash
- Never returned through normal API serialization
- Schema uses `select: false`

The User model removes sensitive/internal fields from normal JSON responses.

---

# 16. AUTHENTICATION

Authentication is implemented using:

```text
JWT
bcryptjs
```

Authentication endpoints:

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

Base URL during development:

```text
http://localhost:5000
```

---

# 17. JWT

JWT payload currently contains only the authenticated user identifier:

```json
{
  "sub": "userId"
}
```

JWT configuration is stored in environment variables.

Current expiration:

```text
JWT_EXPIRES_IN=7d
```

The JWT secret must never be committed or exposed.

---

# 18. AUTHORIZATION

Protected routes use authentication middleware.

Expected header:

```text
Authorization: Bearer <token>
```

The middleware validates the token and provides:

```text
req.userId
```

Protected endpoints must reject:

- Missing authentication
- Invalid authentication
- Unauthorized access

---

# 19. LOGOUT

Current authentication is stateless.

The logout endpoint does not maintain a server-side JWT blacklist.

The client is expected to discard the JWT.

This is intentional for the current MVP architecture.

---

# 20. API RESPONSE CONTRACT

Successful responses follow:

```json
{
  "success": true,
  "data": {}
}
```

Errors follow:

```json
{
  "success": false,
  "error": "..."
}
```

The API should consistently use the `error` property for errors.

---

# 21. CURRENT AUTHENTICATION API STATUS

Authentication implementation is complete.

The following functionality has been implemented and verified.

### Registration

```text
POST /api/auth/register
```

Verified:

- Valid registration works
- User is saved to MongoDB
- Password is bcrypt hashed
- Duplicate email is rejected
- Invalid input is rejected
- Password is not returned

### Login

```text
POST /api/auth/login
```

Verified:

- Correct credentials return a JWT
- Incorrect password is rejected
- Non-existent email is rejected
- Generic authentication errors prevent user enumeration
- Password is not returned

### `/me`

```text
GET /api/auth/me
```

Verified:

- Valid JWT returns the authenticated user
- Missing token returns HTTP 401
- Invalid token returns HTTP 401
- Password is not returned

---

# 22. MILESTONE 1 STATUS

## Milestone 1 — Database + Authentication

**STATUS: COMPLETE ✅**

Verified:

```text
Frontend TypeScript              PASS
Frontend production build        PASS
Backend TypeScript               PASS
Backend production build         PASS
MongoDB Atlas connection         PASS
User registration                PASS
MongoDB persistence              PASS
bcrypt password hashing         PASS
Duplicate registration          PASS
Input validation                 PASS
Correct login                    PASS
Incorrect password               PASS
Non-existent email               PASS
/me with valid JWT               PASS
/me without token                PASS
/me with invalid token           PASS
Secret/log safety                PASS
```

Milestone 1 is considered complete.

---

# 23. RESUME DATA MODEL

The next major backend entity is:

```text
Resume
```

Every saved resume must belong to a registered user.

Conceptually:

```text
User
 └── Resumes
       ├── Personal Information
       ├── Professional Summary
       ├── Work Experience[]
       ├── Education[]
       ├── Skills[]
       ├── Template
       ├── Created At
       └── Updated At
```

Exact field definitions must be reviewed before implementation.

The schema should support:

- Current MVP sections
- Multiple experiences
- Multiple education records
- Multiple skills
- Template selection
- Future template rendering
- Saved resume editing
- Sharing
- Multiple resumes per user

Avoid unnecessary fields.

---

# 24. RESUME OWNERSHIP AND DATA ISOLATION

This is a critical security requirement.

Every saved resume must have an owner.

Conceptually:

```text
ownerId === req.userId
```

Every protected resume query must be scoped to the authenticated user.

For example:

```text
Find resumes belonging to req.userId
```

rather than:

```text
Find any resume by ID
```

A user must NEVER be able to:

- Read another user's resume
- Update another user's resume
- Delete another user's resume
- Duplicate another user's resume
- Access another user's private resume data

Ownership must be enforced by the backend.

Frontend checks are not sufficient.

---

# 25. RESUME API

Planned saved-resume endpoints:

```text
GET    /api/resumes
POST   /api/resumes
GET    /api/resumes/:id
PUT    /api/resumes/:id
DELETE /api/resumes/:id
```

All resume endpoints must require authentication.

Expected architecture:

```text
Request
   ↓
Authentication Middleware
   ↓
req.userId
   ↓
Resume Controller
   ↓
Ownership Validation
   ↓
Mongoose
   ↓
MongoDB Atlas
```

---

# 26. RESUME API REQUIREMENTS

## GET /api/resumes

Returns only resumes owned by the authenticated user.

Must not return another user's resumes.

---

## POST /api/resumes

Creates a new resume owned by the authenticated user.

The server must determine the owner from:

```text
req.userId
```

The client must not be trusted to assign ownership.

---

## GET /api/resumes/:id

Returns a single resume only if it belongs to the authenticated user.

---

## PUT /api/resumes/:id

Updates a resume only if it belongs to the authenticated user.

---

## DELETE /api/resumes/:id

Deletes a resume only if it belongs to the authenticated user.

---

# 27. VALIDATION

Validation must exist on both frontend and backend.

## Frontend validation

Purpose:

- Immediate user feedback
- Better UX
- Form guidance

## Backend validation

Purpose:

- Security
- Data integrity
- API protection

The backend must NEVER trust frontend validation.

Invalid or malformed API requests must be rejected by the backend.

---

# 28. SECURITY REQUIREMENTS

The application must include:

- Secure password hashing
- Authentication
- Authorization
- Protected routes
- Backend validation
- User data isolation
- Secure environment variables
- Sanitized error handling
- Safe logging
- Protection against unauthorized resume access

Rate limiting should be introduced where appropriate, especially for authentication endpoints, without unnecessarily complicating the MVP.

---

# 29. ERROR HANDLING

The backend uses centralized error handling.

Production responses must not expose sensitive internal implementation details.

Errors should remain useful to the client while avoiding:

- Database credentials
- Environment variables
- Stack traces in production
- Passwords
- JWT secrets
- Sensitive internal data

---

# 30. MOBILE-FIRST REQUIREMENT

The application must work on:

- Mobile phones
- Tablets
- Laptops
- Desktop computers

The UI must be designed mobile-first.

Requirements:

- Touch-friendly controls
- Responsive layouts
- Readable typography
- Appropriate spacing
- Accessible form controls
- Usable resume editor on small screens

Desktop enhancements should be added after the mobile experience works properly.

---

# 31. PAGES / SCREENS

## Public screens

- Landing page
- Resume creation/editor
- Template selection
- Resume preview
- Login
- Registration
- Shared resume view

## Authenticated screens

- Dashboard
- Resume editor
- Saved resume view/edit

The exact routing structure may evolve as implementation progresses.

---

# 32. DASHBOARD

The registered-user dashboard will eventually support:

- Viewing saved resumes
- Creating resumes
- Opening resumes
- Editing resumes
- Duplicating resumes
- Deleting resumes
- Viewing last-edited time
- Managing multiple resumes

Dashboard implementation should occur only after the underlying Resume CRUD API is stable.

---

# 33. SHAREABLE RESUMES

Registered users may generate unique shareable links for saved resumes.

Example:

```text
/resume/r/unique-slug
```

Planned endpoints:

```text
POST /api/resumes/:id/share
GET  /api/shared-resumes/:slug
```

Shareable resumes are separate from the future freelancer directory.

Sharing implementation should occur only after saved-resume functionality is complete.

---

# 34. PDF EXPORT

PDF export is an MVP requirement.

The PDF system should consume the same resume data and template system used by the live preview.

Preferred architecture:

```text
Resume Data
     ↓
Template Renderer
     ↓
Live Preview
     ↓
PDF Rendering
```

The project should avoid maintaining completely separate resume layouts for the browser and PDF unless technically necessary.

---

# 35. TESTING STRATEGY

Testing should happen continuously throughout development.

Potential technologies:

```text
Vitest
React Testing Library
Supertest
Playwright
```

Important testing areas:

### Backend

- Authentication
- Validation
- Resume CRUD
- Ownership
- Authorization
- Error handling

### Frontend

- Resume form
- Editor
- Template switching
- Preview
- Authentication state

### End-to-end

Guest workflow:

```text
Open app
→ Create resume
→ Fill information
→ Preview
→ Select template
→ Export PDF
```

Registered workflow:

```text
Register
→ Login
→ Create resume
→ Save
→ Dashboard
→ Edit
→ Delete
→ Share
```

---

# 36. GIT / GITHUB WORKFLOW

Recommended workflow:

```text
main
  ↓
feature branch
  ↓
development
  ↓
testing
  ↓
review
  ↓
merge
```

Commit messages should clearly describe actual changes.

Examples:

```text
feat: add resume mongoose model
feat: add resume CRUD API
test: add resume ownership tests
fix: prevent unauthorized resume access
```

Do not create commits that claim functionality that has not actually been implemented.

---

# 37. DEVELOPMENT MILESTONES

The original 10-milestone plan has been **consolidated into 6 major milestones**.
The historical breakdown is preserved at the end of this section for reference.

---

## Milestone 1 — Foundation & Authentication

Status:

```text
COMPLETE ✅
```

Covers:

- Project foundation (separation from the legacy project)
- Frontend setup — React + TypeScript + Vite + Tailwind + shadcn/ui + React Router
- Backend setup — Node.js + Express + TypeScript + tsx
- MongoDB Atlas connection via Mongoose
- Centralized error handling, CORS, environment configuration, health endpoint
- User model (bcrypt, `select: false`)
- Registration, login, logout, `/me`
- JWT (Bearer tokens, `{ sub }` payload, `JWT_EXPIRES_IN`)
- Authentication middleware → `req.userId`
- Protected routes, input validation, security/log verification

---

## Milestone 2 — Resume Data & Editor

Status:

```text
COMPLETE ✅
```

Covers:

- Resume Mongoose model (nested personal info, experience[], education[], skills[], template, timestamps)
- Owner reference (`ownerId`), immutable after creation
- Resume CRUD API — all authenticated, all owner-scoped:

  ```text
  GET    /api/resumes
  POST   /api/resumes
  GET    /api/resumes/:id
  PUT    /api/resumes/:id
  DELETE /api/resumes/:id
  ```

- Ownership enforced in the query filter; cross-user access returns 404
- Mass-assignment protection (`ownerId` / timestamps cannot be set by the client)
- Full Resume Editor at `/resumes/:id/edit`
  - Resume title
  - Personal information
  - Professional summary
  - Work experience — add / edit / remove
  - Education — add / edit / remove
  - Skills — add / edit / remove (`string[]`)
  - Template selection / state
  - Loading / 404 / 401 / error states
  - Save (`PUT`), unsaved-changes indicator, refresh + in-app navigation guards

- Minimal sign-in / register screen to obtain a JWT in the browser

---

## Milestone 3 — Live Preview & Templates

Status:

```text
COMPLETE ✅
```

Covers:

- Real-time resume preview rendered from the live editor state (no save required)
- Preview updates as any field, section, or the selected template changes
- Reusable template renderer architecture: `Resume Data → Renderer → Classic | Modern | Minimal`
- Three professional, visually distinct template designs — Classic, Modern, Minimal
- Two-column editor / preview layout on desktop; stacked, non-overflowing layout on mobile
- No second source of truth — templates are pure presentational components fed the editor state
- Backend / API contract unchanged

---

## Milestone 4 — PDF Export & Resume Management

Status:

```text
COMPLETE ✅
```

Covers:

- PDF generation and download — implemented via `window.print()` + an `@media print`
  A4 stylesheet and an off-screen `<PrintableResume>`; reuses the same template
  components as the live preview (Classic preview ⇒ Classic PDF). Zero new
  dependencies, real selectable text, browser-handled pagination.
- PDF reflects the current editor state (including unsaved edits) and never writes
  to the backend.
- Resume dashboard at `/dashboard` — list, create, open/edit, delete, empty /
  loading / error states.
- Multiple saved resumes per user; each card shows title, template, last-updated.
- Create / open / edit / delete all go through the existing Resume CRUD API
  (`GET/POST/GET:id/PUT:id/DELETE:id`); no new backend endpoints.
- Auth-aware header nav (Dashboard / Sign out); login lands on `/dashboard`.

---

## Milestone 5 — Sharing & Public Profiles

Status:

```text
COMPLETE ✅
```

Covers:

- **Public resume links** — `Resume.isPublic` (default `false`) + server-minted
  `publicSlug` (readable stem + `node:crypto` random suffix; no ObjectIds in URLs;
  reused across private↔public toggles). Toggle via `PUT /api/resumes/:id/visibility`
  (auth, owner-scoped). Public read at `GET /api/public/resumes/:slug` (no auth,
  allowlisted shape). Route `/r/:slug`.
- **Public profiles** — new one-per-user `Profile` model (`displayName`, `headline`,
  `bio`, `location`, `skills`, `isPublic`, `inDirectory`, `featuredResumeId`, minted
  `slug`). Optional. `GET|PUT /api/profile` (auth); `GET /api/public/profiles/:slug`
  (no auth). Route `/profile/:slug`. One featured public resume per profile (MVP).
- **Directory** — `GET /api/public/directory?q=&skill=` (no auth); only
  `isPublic && inDirectory` profiles; case-insensitive (escaped) regex on
  `headline` / `skills`. Route `/directory`.
- Visibility controls in the editor (Sharing card) + per-resume badge/copy-link on
  the dashboard; profile editor at `/settings/profile`. Clipboard API for copy.
- Migration-safe: new fields default to private; nothing existing becomes public.
- No new dependencies. Existing `/api/resumes/*` unchanged (auth + owner-scoped).

---

## Milestone 6 — Resume Builder Expansion

Status:

```text
COMPLETE ✅
```

Covers:

- Enhanced personal information — `phone2`, `dateOfBirth`, `gender`, `religion`,
  `nationality`, optional `photo` (inline data: URL, client-resized, no storage
  service, no dependency). All optional.
- Work experience `responsibilities: string[]` (bullet points). Legacy
  `experience.description` is migrated to bullets on load and cleared on the next
  save — no content lost.
- `certifications[]` (Certifications & Training) as a separate section.
- `languages[]` (`language` + controlled `proficiency`).
- `references[]` (private — never returned by any public endpoint).
- Multi-step wizard editor (8 steps) — same single `fields` state, same save
  flow, same unsaved-changes / refresh / navigation guards.
- Three new templates — Professional, Executive, Creative (six total), all
  rendering the expanded data with empty sections hidden.
- Real landing page at `/`.
- Editor / template-selector / responsive UX polish.
- Public allowlist deliberately reviewed: `phone2` + `photo` added;
  `dateOfBirth` / `gender` / `religion` / `nationality` / `references` withheld.

---

## Milestone 7 — PDF, QA & Production

Status:

```text
COMPLETE ✅
```

Covers:

- **PDF pagination root cause fixed.** The old print CSS hid the app with
  `visibility: hidden` + `position: absolute`, which left the full editor page in
  the print layout — the browser then paginated that whitespace, adding blank
  pages. `<PrintableResume>` now renders through a portal as a `<body>`-level
  sibling of `#root`; `@media print` sets `#root { display: none }` and shows only
  `#resume-print` in normal flow, so the browser paginates the real résumé
  content. Verified: empty / short / photo → 1 page; medium → 2; long → 3–4;
  across all six templates; clean section-boundary breaks, no clipping.
- **PDF output cleaned.** `@page { margin: 0 }` removes the browser's
  date / URL / page-number band; the sheet supplies its own 14 mm padding. No app
  code renders timestamps, platform name, or URLs into the document.
- **Regression testing.** Backend `tsc` + `build` + `test:api` (31 tests, incl. 6
  new M7 hardening tests); frontend `tsc` + `lint` + `build`; headless-browser
  suite (46 checks); PDF suite (30 template × size combinations). All pass.
- **Security review.** Auth (JWT verify, expiry, tampering → 401 generic), owner
  scoping (cross-user read/write/delete/visibility → 404), mass-assignment guard,
  public-endpoint allowlists (DOB / gender / religion / nationality / references
  never served), password never serialized. **Fixed:** Express body-parser errors
  (`SyntaxError`, `PayloadTooLargeError`) bypassed `ApiError` and returned 500 —
  now 400 / 413 with a safe message; the 100 kB default JSON limit would have
  500'd real profile photos — raised to a configurable 1 MB. 500 responses are
  now always generic (no dev-mode leak).
- **Validation / edge cases.** Added a 50-entry cap to repeatable résumé sections
  and de-duplication of skills. Verified: long strings clamp, unusual Unicode,
  malformed ObjectIds → 400, invalid slugs → 404, oversized / non-data-URL photo
  → 400, invalid proficiency → 400, array / string bodies → 400.
- **Accessibility.** Added a page `<h1>` to the auth screen and the editor;
  section-card titles are now `<h2>` (were `<h3>`, an outline jump); the live
  preview is `aria-hidden` (decorative duplicate of the form); the stepper gained
  `role="progressbar"` and per-step `aria-label`s. Existing coverage confirmed:
  label association, `aria-label` on icon buttons, `role="alert"` on errors,
  `aria-live` on save status, visible focus rings, keyboard-operable wizard.
  Structural audit clean on 12 page / step states.
- **Responsive.** No horizontal overflow at 390 / 768 / 1280 across home, login,
  directory, dashboard, profile settings, editor (all 8 steps), public résumé,
  and all six templates.
- **Performance.** Data effects already use `AbortController` (no duplicate
  requests; StrictMode-safe). Photos are client-resized to ≤ 480 px JPEG. Bundle
  ~122 kB gzip, single chunk — acceptable; route code-splitting noted as
  optional. No memoization added (no measured hot path).
- **Production config & deployment readiness.** Env-driven CORS allowlist
  (`CORS_ORIGIN`); configurable body limit (`JSON_BODY_LIMIT`); `NODE_ENV`
  documented; SPA history-fallback (`frontend/public/_redirects`); `.env.example`
  files updated for both apps; **`DEPLOYMENT.md`** documents build / start
  commands, required env-var **names**, CORS, SPA routing, and the
  `GET /api/health` check. Frontend already reads `VITE_API_BASE_URL` with a
  localhost fallback. No deployment performed (environment does not authorize it).

Known non-critical limitations:

- Résumés spanning 3+ pages get a reduced top margin on continuation pages (the
  sheet padding applies once, not per printed page). Acceptable without a JS
  pagination library; revisit in the post-M7 UI/UX phase.
- `frontend/dist` bundle is a single chunk; route-level code-splitting is a
  possible future optimisation, not a current problem.
- One pre-existing `oxlint` warning in `components/ui/button.tsx`
  (`react(only-export-components)` on the `buttonVariants` export) — unrelated to
  M7, left as-is.

---

## Milestone 8 — Guest Builder, Account Transfer & Admin Dashboard

Status:

```text
IMPLEMENTED — DB-backed verification blocked this session by an Atlas
connectivity outage in this environment (see below); re-run before deploying.
```

Covers:

* **Guest mode (no account required).** `/build` runs the full 8-step wizard —
  same `ResumeWizard` component, same six templates, same PDF export — with
  state kept only in this browser's `localStorage` (`rb_guest_resume`).
  Nothing is sent to MongoDB while browsing as a guest.
* **Reused, not duplicated.** The wizard body (stepper, all section forms,
  live preview, `PrintableResume`) was extracted out of `ResumeEditor.tsx`
  into `components/resume-editor/ResumeWizard.tsx`; both the authenticated
  editor and the guest builder render the same component. No template or
  editor-section code is duplicated.
* **Save prompt, not a wall.** Clicking "Save my resume" as a guest opens an
  explanatory dialog ("Want to save your resume?") with three real choices:
  create an account, log in, or continue as a guest — never a silent failure,
  never a bare redirect.
* **Guest → account transfer.** Registering/logging in from that dialog sends
  the user to `/resumes/claim-guest`, which POSTs the browser-local résumé to
  the existing `POST /api/resumes` endpoint, then clears local guest state and
  opens the new saved resume in the normal editor. A failed transfer leaves
  the guest data in place (retryable, nothing lost) rather than losing it.
* **Admin dashboard**, authorization enforced **server-side only**: a `role`
  field (`"user" | "admin"`, default `"user"`) on `User`, a `requireAdmin`
  middleware that re-reads the role from the database on every request (never
  trusts the JWT or the client), and two protected endpoints —
  `GET /api/admin/stats` (totals, template usage, 14-day trend) and
  `GET /api/admin/activity` (recent signups / saved resumes / events). No
  public self-promotion path exists; the only way to grant admin is
  `backend/scripts/promote-admin.ts <email>`, run with shell/deploy access.
* **Minimal anonymous analytics.** A new `AnalyticsEvent` collection records
  only an event type, an optional `userId` (from a verified token, never the
  request body), and an optional template name — never résumé content, names,
  emails, or credentials. Events: `resume_started`, `resume_completed`,
  `resume_downloaded`, `account_registered`, `resume_saved`,
  `template_selected`, each fired once per genuine user action (guarded with
  refs so React's dev-mode double-render/double-effect can't double-count).

Known limitation — **could not run this session**: MongoDB Atlas rejected
every connection attempt from this environment for the remainder of the
session (confirmed at the driver level — TCP reachable, but server selection
fails; consistent with the IP-allowlist/rotating-egress-IP issue noted
earlier in this document). As a result:

* `npm run test:api`'s DB-backed tests (both `verify-resume-api.ts` and the
  new `verify-m8-api.ts`) could not execute — they **skipped**, not failed.
  The 10 tests that don't need a database (auth guards, admin 401s, analytics
  400s) all ran and passed.
* The browser-based guest→account transfer, authenticated regression, and
  admin-with-real-data checks could not run (they need the API + database).
* What **did** run and pass: backend `tsc`/`build` (both apps), frontend
  `tsc`/`lint`/`build`, and 28 headless-browser checks covering everything
  that doesn't require the database — the entire guest flow end-to-end
  (build, template switching, refresh persistence, PDF trigger, the save
  dialog, "start new resume", 390px responsiveness), plus admin/claim-guest
  fail-safe behavior while logged out.

**Before deploying: re-run `npm run test:api` from an environment where
Atlas is reachable, and re-run the full browser regression (guest → register
→ transfer → dashboard; guest → log in → transfer; authenticated regression;
admin authorization with a real promoted account) — see the M8 report for
exact commands.**

---

## Appendix — original 10-milestone breakdown (historical)

```text
Milestone 0  Project Foundation          → M1
Milestone 1  Database + Authentication   → M1
Milestone 2  Resume Model + CRUD API     → M2
Milestone 3  Resume Editor               → M2
Milestone 4  Live Preview                → M3
Milestone 5  Resume Templates            → M3
Milestone 6  PDF Export                  → M4
Milestone 7  Saved Resumes + Dashboard   → M4
Milestone 8  Shareable Resumes           → M5
Milestone 9  Testing + Quality           → M6
Milestone 10 Production Deployment       → M6
```

---

# 38. MVP DEFINITION OF DONE

The MVP is complete when the following workflows reliably work.

## Guest acceptance test

```text
Open application
    ↓
Create resume
    ↓
Enter personal information
    ↓
Enter summary
    ↓
Add experience
    ↓
Add education
    ↓
Add skills
    ↓
See live preview
    ↓
Choose template
    ↓
Switch templates
    ↓
Download PDF
```

No account should be required for this workflow.

---

## Registered user acceptance test

``text
Register
↓
Login
↓
Create resume
↓
Save resume
↓
View dashboard
↓
Open saved resume
↓
Edit resume
↓
Duplicate resume
↓
Delete resume
↓
Generate share link
↓
Open shared resume

````

A registered user must never be able to access another user's private saved resume.

---

# 39. OUT OF SCOPE FOR MVP

The following are explicitly excluded:

* Freelancer directory
* Freelancer search
* Freelancer filtering
* Public freelancer profiles
* Messaging
* Payments
* Premium templates
* AI resume generation
* Cover letters
* Job board
* Social login
* Analytics
* Advanced customization
* Drag-and-drop reordering
* Complex skill ratings
* Complex design editor

Do not add these features without explicit approval.

---

# 40. PHASE 2 BACKLOG

Potential future features:

* Freelancer directory
* Freelancer search
* Freelancer profiles
* AI-assisted writing
* Cover letters
* Job matching
* Analytics
* Messaging
* Job board
* Additional templates
* Advanced customization

These features are not part of the MVP.

---

# 41. ARCHITECTURE DECISION RULES

The following rules apply throughout development:

1. MVP first.
2. Do not add unapproved features.
3. Do not change the architecture without approval.
4. Prefer simple solutions over complex solutions.
5. Keep the resume data model reusable.
6. Mobile-first design is mandatory.
7. Security by default.
8. Backend validation is mandatory.
9. Test important flows.
10. Make small, reviewable changes.
11. Do not rebuild completed functionality.
12. Do not introduce dependencies without justification.
13. Keep frontend, backend, and database responsibilities separated.
14. Do not trust the frontend for authorization.
15. Every saved resume must be scoped to its owner.

---

# 42. CLAUDE CODE WORKING RULES

Claude Code must follow these rules when working on this project.

## Before modifying code

Claude must:

1. Inspect the existing project.
2. Read `PROJECT_PLAN.md`.
3. Inspect the relevant existing implementation.
4. Check the current file structure.
5. Check Git status.
6. Understand what has already been completed.
7. Avoid recreating existing functionality.

## Implementation rules

Claude must:

* Make minimal, focused changes.
* Follow the locked architecture.
* Use MongoDB Atlas + Mongoose.
* Use the existing authentication system.
* Reuse existing utilities where appropriate.
* Avoid unnecessary dependencies.
* Explain meaningful architecture decisions.
* Add appropriate tests.
* Typecheck after changes.
* Build after meaningful changes.
* Report exactly what changed.
* Report exactly what was tested.
* Report anything incomplete.

## Claude must NOT:

* Rebuild the project from scratch.
* Replace MongoDB with SQLite.
* Replace Mongoose with Prisma.
* Replace the authentication architecture without approval.
* Modify the legacy project.
* Add unapproved features.
* Redesign unrelated parts of the application.
* Assume tests pass without running them.
* Claim completion when functionality is incomplete.
* Expose secrets.
* Print `.env` contents.
* Print passwords.
* Print JWT secrets.
* Print MongoDB credentials.

---

# 43. LEGACY PROJECT WARNING

There is an older project located at:

```text
C:\Users\USER\Documents\resume-builder_old\
````

The legacy project is OUT OF SCOPE.

Do not modify:

```text
resume-builder_old\backend\
resume-builder_old\frontend\
```

The current project is:

```text
C:\Users\USER\Documents\resume-builder-v2\
```

Only V2 should be modified.

---

# 44. DEVELOPMENT WORKFLOW

The project follows this workflow:

```text
Requirements
    ↓
Project Plan
    ↓
Architecture
    ↓
Milestone Specification
    ↓
Claude Code Prompt
    ↓
Implementation
    ↓
Typecheck
    ↓
Build
    ↓
API / UI Testing
    ↓
Review
    ↓
Fixes
    ↓
Git Commit
    ↓
Next Milestone
```

Each milestone should be completed and verified before moving to the next one.

---

# 45. CURRENT PROJECT STATUS

## Completed

```text
Product idea defined                         ✅
MVP scope defined                            ✅
User types defined                           ✅
Resume sections defined                     ✅
Three initial templates defined              ✅
Guest flow defined                           ✅
Registered user flow defined                 ✅
Shareable resume concept defined             ✅
Phase 2 freelancer directory separated      ✅

Project foundation                           ✅
React frontend                               ✅
Express backend                              ✅
TypeScript                                   ✅
Tailwind CSS                                 ✅
shadcn/ui                                    ✅
React Router                                 ✅
MongoDB Atlas                                ✅
Mongoose                                     ✅
Environment configuration                    ✅
CORS                                         ✅
Centralized error handling                   ✅
Health endpoint                              ✅

User model                                   ✅
Registration                                 ✅
bcrypt password hashing                      ✅
Duplicate protection                         ✅
Input validation                             ✅
JWT login                                    ✅
JWT middleware                               ✅
/me endpoint                                 ✅
Authentication testing                       ✅
Security/log verification                    ✅

Resume Mongoose model                        ✅
Resume CRUD API                              ✅
Resume ownership / data isolation            ✅
Resume input validation                      ✅
Resume Editor UI (/resumes/:id/edit)         ✅
Editor save + unsaved-changes protection     ✅
```

---

# 46. CURRENT NEXT STEP

Milestones 1–7 are complete, verified, and deployed. Milestone 8 (guest
builder, guest→account transfer, admin dashboard, minimal analytics) is
implemented, typechecked, built, and verified everywhere that doesn't need a
live database — see Milestone 8 above for exactly what could and couldn't run
this session.

Before deploying M8:

1. Confirm MongoDB Atlas is reachable from wherever `npm run test:api` runs,
   then run it — expect all tests to pass (not skip).
2. Run the full browser regression: guest builds a resume → registers →
   confirm it lands in the dashboard; guest builds a resume → logs into an
   existing account → confirm transfer; normal authenticated regression
   (dashboard/editor/PDF/public resume/directory); admin authorization
   (401 logged out, 403 as a normal user, 200 as an admin).
3. Promote your own account to admin: `npx tsx scripts/promote-admin.ts <your-email>`
   from `backend/` (shell/deploy access only — never over HTTP).
4. Deploy backend, then frontend, per `DEPLOYMENT.md` (no new environment
   variables were introduced by M8).
5. Then begin the dedicated post-M7/M8 **UI/UX refinement** phase.

---

# 47. FINAL MVP PRINCIPLE

The first goal is to prove one complete, reliable experience:

```text
Create
   ↓
Fill
   ↓
Preview
   ↓
Choose Design
   ↓
Export PDF
```

The registered-user extension is:

```text
Create
   ↓
Preview
   ↓
Export
   ↓
Save
   ↓
Manage
   ↓
Share
```

The application must remain:

```text
Free
Simple
Fast
Mobile-first
Professional
Accessible
Secure
```

The project should prioritize a reliable MVP over unnecessary complexity.
