# Job Quest - Backend API

Express + MongoDB (Mongoose) REST API for the Job Quest frontend. Base URL: `http://localhost:5000/api/v1`.

## Setup
```bash
cd backend
npm install
cp .env.example .env      # then edit .env (see below)
npm run seed              # optional: demo data (deletes existing data first!)
npm run dev               # http://localhost:5000
```
Check it works: open `http://localhost:5000/api/v1/health`.

### Environment variables (`.env`)
| Variable | Purpose |
|---|---|
| `PORT`, `NODE_ENV` | Server port and mode |
| `MONGO_URI` | Local `mongodb://127.0.0.1:27017/jobquest` or an Atlas `mongodb+srv://...` string. Required in production. |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing. The server will not start without `JWT_SECRET`. |
| `CLIENT_URL` | Frontend URL(s) allowed by CORS (comma separated) |
| `SERVER_URL` | Public URL of this API, used to build links to locally stored uploads |
| `CLOUDINARY_*` | Optional. Leave empty to keep uploads on local disk (`src/uploads`, served at `/uploads`). Fill all three and restart to switch to Cloudinary - no code changes. |
| `SEED_*` | Credentials used by `npm run seed`. Local development only. |

Connect the frontend by setting `VITE_API_URL=http://localhost:5000/api/v1` in `frontend/.env`.

### Demo logins after `npm run seed`
| Role | Email | Password |
|---|---|---|
| Admin | `admin@jobquest.local` | `Admin@12345` |
| Job seeker | `saroj@example.com` | `Password123` |
| Employer (verified) | `hr@himaltech.example` | `Password123` |
| Employer (pending verification) | `hello@everlake.example` | `Password123` |

These come from `SEED_*` variables, are for local development only, and the seed script refuses to run in production unless `ALLOW_SEED=true`.
All seeded companies, people and jobs are fictional.

## Structure
```
src/
  config/        env, MongoDB, Cloudinary
  models/        16 Mongoose models
  routes/        URL -> controller wiring + role checks
  controllers/   read the request, call a service, send the response
  services/      business rules (jobs, applications, uploads, matching, admin ...)
  middleware/    auth (JWT + roles), validation, uploads, errors, rate limits, sanitising
  validators/    Zod schemas for request bodies
  utils/  constants/  seed/
```
Flow: `route -> middleware -> controller -> service -> model -> MongoDB`.

## Response format
Success `{ success: true, message, data, pagination? }`, error `{ success: false, message, errors: [] }`.
Status codes used: 400, 401, 403, 404, 409 (duplicates, category in use), 413 (file too large), 422 (validation), 429, 500.

## How the main flows work
- **Job approval:** employer submits a job -> `PENDING_APPROVAL` (or `PUBLISHED` if admin turned approval off in Settings). Admin approves -> `PUBLISHED`, employer is notified, matching job alerts are notified. Jobs from unverified companies cannot be approved while "require employer verification" is on.
- **Applying:** one application per candidate per job (unique index + 409). The resume is copied into the application, so deleting it later does not break the employer's link. Employer status changes append to `statusHistory` and notify the candidate.
- **Employer verification:** `PENDING -> VERIFIED / REJECTED / SUSPENDED`. Rejected and suspended companies and their jobs are hidden from public pages.
- **Categories / locations:** deleting one that jobs still use returns 409; deactivate instead. Inactive ones cannot be chosen for new jobs.
- **Expiry:** an hourly timer marks past-deadline jobs `EXPIRED` and notifies employers about jobs closing within 2 days.

## Recommendation / match score (`services/matchService.js`)
Score 0-100 = skills overlap (40) + category affinity from jobs the user saved/applied to (20) + preferred location or remote (15) + job-type preference (10) + experience fit (15). It is a relevance hint, not a hiring prediction.

## Security notes
bcrypt (12 rounds) password hashing - JWT with `passwordChangedAt` check (password reset signs everyone out) - Helmet, CORS allow-list - rate limits on auth/contact/API - request bodies are whitelisted by Zod (no mass assignment, role cannot be self-assigned to ADMIN) - `$`/`.` keys stripped from input (NoSQL injection) - sort fields whitelisted - uploads checked by type, size and file signature - no stack traces in production - uploaded-file deletion is confined to the uploads folder.

## Known limitations (good next steps)
- Email is a console stub (`services/emailService.js`); the password-reset link is printed in the server console in development.
- Job alerts send an in-app notification immediately; the stored `frequency` is ready for a future email digest.
- JWT logout is client-side (stateless tokens).
- Salary filters compare the entered numbers without converting between pay periods.
- Keyword search uses regular expressions; for large data add a MongoDB text/Atlas Search index.
- No automated tests yet.

## Endpoint summary
Matches the table in the frontend README. Public: `GET /jobs`, `/jobs/:id`, `/jobs/:id/related`, `/jobs/popular-searches`, `/jobs/stats`, `/companies`, `/companies/:id`, `/categories`, `/locations`, `/articles`, `POST /contact`, auth routes. Job seeker: `/users/*`, `/applications` (apply, `/my`, withdraw), `/saved-jobs`, `/job-alerts`, `/jobs/recommended`. Employer: `/jobs` (create/update/status/duplicate/delete, `/employer/mine`), `/applications/job/:jobId`, `/applications/employer`, `PATCH /applications/:id/status`, `/companies/my`, `/companies/my/dashboard`, `/interviews`. Admin: everything under `/admin/*` plus category/location writes and `PATCH /jobs/:id/feature`. All roles: `/notifications`, `GET /applications/:id` (access checked per record), `POST /reports`.
