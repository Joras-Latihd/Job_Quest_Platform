# Job Quest

Full-stack job search and recruitment platform for Nepal (MERN). This archive contains the complete **frontend**. The backend is built next and must follow the API contract below.

**Tagline:** Find the right opportunity. Build your next chapter.

## Tech
React 18, Vite, React Router 6, Tailwind CSS, Axios, TanStack Query, Zustand, React Hook Form + Zod, Recharts, Lucide icons.

## Run the frontend
```bash
cd frontend
npm install
cp .env.example .env     # set VITE_API_URL (default http://localhost:5000/api/v1)
npm run dev              # http://localhost:5173
```

## Frontend structure
```
frontend/src/
  components/ui/        Button, Input, Select, Modal, Drawer, Badge, Avatar, Skeleton, DataTable, Pagination, Toaster ...
  components/common/    Navbar, Footer, SearchBar, SaveJobButton, NotificationDropdown, ProfileCompletion, ApplicationStatus ...
  components/jobs|companies|home|employer|admin/   feature components
  pages/                public pages (Home, FindJobs, JobDetails, Companies, About, Contact ...)
  pages/auth|dashboard|employer|admin|shared/      one folder per role area
  layouts/              Public, Auth, DashboardShell (+ Seeker, Employer, Admin wrappers)
  routes/               AppRoutes (lazy loaded) + ProtectedRoute (role guard)
  services/             one file per API area; components never call axios directly
  store/                authStore (JWT + user), toastStore
  hooks/                useSearchFilters (URL state), useTableQuery, useActionMutation, useMeta ...
  schemas/              Zod validation schemas
  constants/ utils/
```

## Routes
Public: `/`, `/find-jobs`, `/jobs/:jobId`, `/companies`, `/companies/:companyId`, `/career-resources`, `/about`, `/contact`, `/privacy`, `/terms`, `/login`, `/register`, `/forgot-password`, `/reset-password/:token`
Job seeker (`JOB_SEEKER`): `/dashboard` + `applications`, `saved-jobs`, `alerts`, `interviews`, `profile`, `resumes`, `notifications`, `settings`
Employer (`EMPLOYER`): `/employer/dashboard`, `jobs`, `jobs/new`, `jobs/:id/edit`, `jobs/:id/applicants`, `applicants`, `applications/:id`, `interviews`, `company`, `notifications`, `settings`
Admin (`ADMIN`): `/admin` + `users`, `job-seekers`, `employers`, `companies`, `jobs`, `applications`, `categories`, `locations`, `reports`, `featured-jobs`, `messages`, `notifications`, `settings`, `audit-logs`

Route guards on the frontend are for usability only. The backend must enforce every role check (403 for wrong role).

## API contract the frontend expects
Base: `/api/v1`. Success: `{ success, message, data, pagination? }`. Error: `{ success:false, message, errors:[] }`. JWT in `Authorization: Bearer <token>`.
List endpoints accept `page`, `limit`, `search`, `sort` (`-field` = descending) and return `pagination: { page, limit, total, pages }`.

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register` (role, name, email, password, + companyName, industry, companySize, phone for employers) -> `data:{token,user}`; `POST /auth/login` -> `data:{token,user}`; `POST /auth/logout`; `GET /auth/me`; `POST /auth/forgot-password`; `POST /auth/reset-password` `{token,password}`; `PUT /auth/change-password` `{currentPassword,newPassword}` |
| Jobs | `GET /jobs` (keyword, location, category=slug, type, experience=`0`/`0-1`/`1-3`/`3-5`/`5-10`/`10+`, minSalary, maxSalary, workplace, education, datePosted=`today`/`3d`/`7d`/`30d`, urgent, featured, verified, company, sort=`newest`/`oldest`/`deadline`/`salary_asc`/`salary_desc`); `GET /jobs/:id` (adds `isSaved`, `hasApplied`, `matchScore` when logged in); `GET /jobs/:id/related`; `GET /jobs/recommended`; `GET /jobs/popular-searches` -> `data:[string]`; `GET /jobs/stats` -> `{jobs,companies,candidates,applications}`; `GET /jobs/employer/mine`; `POST /jobs`; `PUT /jobs/:id`; `POST /jobs/:id/duplicate`; `PATCH /jobs/:id/status` `{status}`; `PATCH /jobs/:id/feature` `{isFeatured}`; `DELETE /jobs/:id` |
| Applications | `POST /applications` `{job,resume,coverLetter,answers}`; `GET /applications/my`; `GET /applications/:id`; `PATCH /applications/:id/status` `{status,note}`; `PATCH /applications/:id/withdraw`; `GET /applications/job/:jobId`; `GET /applications/employer` (filters: status, experience, education, skills) |
| Users | `GET /users/dashboard` -> `{stats:{applications,savedJobs,interviews}, recentApplications, recommendedJobs, savedJobs, upcomingInterviews, alerts}`; `PUT /users/profile`; `POST /users/profile-image` (field `image`); `POST /users/resumes` (field `resume`); `PUT /users/resumes/:id`; `PATCH /users/resumes/:id/default`; `DELETE /users/resumes/:id` |
| Saved jobs | `GET /saved-jobs` -> items `{_id, job, savedAt}`; `POST /saved-jobs/:jobId`; `DELETE /saved-jobs/:jobId` |
| Companies | `GET /companies` (search, industry, location, size, verified); `GET /companies/:id`; `GET /companies/my`; `GET /companies/my/dashboard` -> `{company, stats:{activeJobs,totalApplications,shortlisted,interviews}, recentApplicants, recentJobs, statusBreakdown:[{status,count}]}`; `POST /companies`, `PUT /companies/:id` (multipart: `logo`, `coverImage`, `socialLinks` as JSON string) |
| Meta | `GET/POST/PUT/DELETE /categories`, `/locations` (read is public; `status=active\|inactive`; category has `slug`, `icon`, `activeJobs`; location has `city,district,province,country,activeJobs`). Deleting a category/location still in use must return 409 with an explanation. |
| Alerts / interviews / reports / contact / articles | `/job-alerts` CRUD; `/interviews` (`POST {application,scheduledAt,type,locationOrLink,notes}`, `GET`, `PUT`, `DELETE`); `POST /reports {job,reason,details}`; `POST /contact`; `GET /articles`, `GET /articles/:slug` |
| Notifications | `GET /notifications` -> `{data, unreadCount, pagination}`; `PATCH /notifications/:id/read`; `PATCH /notifications/read-all` |
| Admin | `GET /admin/dashboard` -> `{stats:{totalUsers,jobSeekers,employers,companies,activeJobs,pendingJobs,applications,newUsers}, jobsOverTime, applicationsOverTime, registrations, jobsByCategory, jobsByLocation}` (series items `{label,value}`); `GET /admin/users` (role, isActive); `PATCH/DELETE /admin/users/:id`; `GET /admin/employers` (status); `PATCH /admin/employers/:id/verify {status,reason}`; `GET /admin/companies`; `GET /admin/jobs` (status, category, employer, featured, featureRequested); `PATCH /admin/jobs/:id/approve`; `PATCH /admin/jobs/:id/reject {reason}`; `GET /admin/applications`; `GET /admin/reports`; `PATCH /admin/reports/:id`; `GET /admin/messages`; `PATCH /admin/messages/:id`; `GET/POST /admin/notifications`; `GET/PUT /admin/settings`; `GET /admin/audit-logs` |

Enums: roles `JOB_SEEKER|EMPLOYER|ADMIN`; job status `DRAFT|PENDING_APPROVAL|PUBLISHED|CLOSED|REJECTED|EXPIRED`; application status `APPLIED|UNDER_REVIEW|SHORTLISTED|INTERVIEW|SELECTED|REJECTED|WITHDRAWN`; company `verificationStatus` `VERIFIED|PENDING|SUSPENDED|REJECTED`; job type `FULL_TIME|PART_TIME|CONTRACT|INTERNSHIP|FREELANCE|TEMPORARY`; workplace `ON_SITE|REMOTE|HYBRID`; education `SEE|PLUS_TWO|BACHELOR|MASTER|PHD|OTHER`.

Populated job shape: `company {_id,name,logo,verificationStatus,industry,location,size,website}`, `category {_id,name,slug}`, `location {_id,city,country}`, `salary {min,max,currency,period,negotiable}`, `experience {min,max}`, arrays for responsibilities/requirements/qualifications/benefits/skills, `screeningQuestions [{_id,question,required}]`.

## Notes
- Demo data and the seeded admin account will come with the backend seed script (local development only).
- Privacy and Terms pages are placeholder text and have not had legal review.
