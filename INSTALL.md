# Job details update - install guide

This update only touches the job details flow (public page, apply wizard) and adds an admin job detail page.
It does NOT touch your styling, layouts, home page, dashboards or the existing admin pages.

## 0. Back up first
Copy these existing files somewhere safe (they will be replaced):
- `frontend/src/pages/JobDetailsPage.jsx`
- `frontend/src/components/jobs/details/` (the whole folder)

## 1. Copy the files
Copy the `frontend/src` folder from this zip over your project's `frontend/src` folder (merge, replace when asked).

New files: `components/common/ErrorBoundary.jsx`, `components/jobs/details/{ApplyAction,ApplyCard,JobStatusBanner,JobSummaryBar,MobileApplyBar}.jsx`, `pages/admin/AdminJobDetailPage.jsx`
Replaced files: `pages/JobDetailsPage.jsx`, `components/jobs/details/{ApplyModal,CompanySidebar,JobContent,JobHeader,RelatedJobs}.jsx`

## 2. Two small edits for the admin page (do NOT replace these files, just add the lines)

### a) `frontend/src/routes/AppRoutes.jsx`
Add next to the other admin page imports:
```js
const AdminJobDetailPage = page(() => import('@/pages/admin/AdminJobDetailPage'));
```
Add inside the `<Route path="admin" ...>` block, next to the other `jobs` routes:
```jsx
<Route path="jobs/:jobId" element={<AdminJobDetailPage />} />
```
(keep the existing `jobs/:jobId/edit` route as it is)

### b) `frontend/src/pages/admin/AdminJobsPage.jsx`
Make sure `Link` is imported from `react-router-dom` (it already is), then in the `actions` cell add one button:
```jsx
<Button as={Link} to={`/admin/jobs/${job._id}`} variant="ghost" size="sm">Details</Button>
```
Optionally make the job title in the first column a link to the same address.

## 3. Backend: one line (optional but recommended)
In `backend/src/services/adminService.js`, inside `listReports`, add after the `reason` line:
```js
if (isObjectId(query.job)) filter.job = query.job;
```
This lets the admin job page load only the reports of that job. Without it the page still works (it filters in the browser).

## 4. What you get
- Job page: breadcrumb, header with Apply/Save/Share/Report, job summary grid, description, responsibilities, requirements, qualifications, skills, benefits, how-to-apply, safety note, sticky Apply card, company card, similar jobs, mobile apply bar.
- Apply wizard: profile check, resume selection with preview and in-flow upload, cover letter (with sample), employer questions, review, success screen, duplicate/closed handling.
- Employer/admin previews of drafts, pending, rejected and closed jobs, with a status banner and quick links.
- Admin: `/admin/jobs/:jobId` moderation view (approve, reject with reason, feature, hide, close, delete, reports, recent applicants).
- A page that crashes now shows a readable message (and the real error in development) instead of a blank screen. To protect other pages the same way, wrap `<AppRoutes />` in `<ErrorBoundary>` inside `App.jsx`.

## If the page is still blank
Press F12, open the Console tab, reload the job page and send me the first red error. Also check the Network tab: the request `GET /api/v1/jobs/<id>` should return 200.
