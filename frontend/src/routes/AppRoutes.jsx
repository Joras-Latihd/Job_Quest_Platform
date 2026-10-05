import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicLayout from '@/layouts/PublicLayout';
import AuthLayout from '@/layouts/AuthLayout';
import SeekerLayout from '@/layouts/SeekerLayout';
import EmployerLayout from '@/layouts/EmployerLayout';
import AdminLayout from '@/layouts/AdminLayout';
import { PageLoader } from '@/components/ui/Spinner';
import { ROLES } from '@/constants';

// Every page is lazy-loaded so the first visit downloads only what it needs.
const page = (loader) => lazy(loader);

const HomePage = page(() => import('@/pages/HomePage'));
const FindJobsPage = page(() => import('@/pages/FindJobsPage'));
const JobDetailsPage = page(() => import('@/pages/JobDetailsPage'));
const CompaniesPage = page(() => import('@/pages/CompaniesPage'));
const CompanyDetailsPage = page(() => import('@/pages/CompanyDetailsPage'));
const AboutPage = page(() => import('@/pages/AboutPage'));
const ContactPage = page(() => import('@/pages/ContactPage'));
const CareerResourcesPage = page(() => import('@/pages/CareerResourcesPage'));
const ArticlePage = page(() => import('@/pages/ArticlePage'));
const LegalPage = page(() => import('@/pages/LegalPage'));
const NotFoundPage = page(() => import('@/pages/NotFoundPage'));

const LoginPage = page(() => import('@/pages/auth/LoginPage'));
const RegisterPage = page(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = page(() => import('@/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = page(() => import('@/pages/auth/ResetPasswordPage'));

const NotificationsPage = page(() => import('@/pages/shared/NotificationsPage'));
const AccountSettingsPage = page(() => import('@/pages/shared/AccountSettingsPage'));
const InterviewsPage = page(() => import('@/pages/shared/InterviewsPage'));

const SeekerOverviewPage = page(() => import('@/pages/dashboard/SeekerOverviewPage'));
const MyApplicationsPage = page(() => import('@/pages/dashboard/MyApplicationsPage'));
const ApplicationDetailPage = page(() => import('@/pages/dashboard/ApplicationDetailPage'));
const SavedJobsPage = page(() => import('@/pages/dashboard/SavedJobsPage'));
const JobAlertsPage = page(() => import('@/pages/dashboard/JobAlertsPage'));
const ProfilePage = page(() => import('@/pages/dashboard/ProfilePage'));
const ResumesPage = page(() => import('@/pages/dashboard/ResumesPage'));

const EmployerDashboardPage = page(() => import('@/pages/employer/EmployerDashboardPage'));
const MyJobsPage = page(() => import('@/pages/employer/MyJobsPage'));
const PostJobPage = page(() => import('@/pages/employer/PostJobPage'));
const ApplicantsPage = page(() => import('@/pages/employer/ApplicantsPage'));
const ApplicationReviewPage = page(() => import('@/pages/employer/ApplicationReviewPage'));
const CompanyProfilePage = page(() => import('@/pages/employer/CompanyProfilePage'));

const AdminDashboardPage = page(() => import('@/pages/admin/AdminDashboardPage'));
const AdminUsersPage = page(() => import('@/pages/admin/AdminUsersPage'));
const AdminEmployersPage = page(() => import('@/pages/admin/AdminEmployersPage'));
const AdminCompaniesPage = page(() => import('@/pages/admin/AdminCompaniesPage'));
const AdminJobsPage = page(() => import('@/pages/admin/AdminJobsPage'));
const AdminApplicationsPage = page(() => import('@/pages/admin/AdminApplicationsPage'));
const AdminCategoriesPage = page(() => import('@/pages/admin/AdminCategoriesPage'));
const AdminLocationsPage = page(() => import('@/pages/admin/AdminLocationsPage'));
const AdminReportsPage = page(() => import('@/pages/admin/AdminReportsPage'));
const AdminFeaturedJobsPage = page(() => import('@/pages/admin/AdminFeaturedJobsPage'));
const AdminMessagesPage = page(() => import('@/pages/admin/AdminMessagesPage'));
const AdminNotificationsPage = page(() => import('@/pages/admin/AdminNotificationsPage'));
const AdminSettingsPage = page(() => import('@/pages/admin/AdminSettingsPage'));
const AdminAuditLogsPage = page(() => import('@/pages/admin/AdminAuditLogsPage'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<HomePage />} />
          <Route path="find-jobs" element={<FindJobsPage />} />
          <Route path="jobs/:jobId" element={<JobDetailsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="companies/:companyId" element={<CompanyDetailsPage />} />
          <Route path="career-resources" element={<CareerResourcesPage />} />
          <Route path="career-resources/:slug" element={<ArticlePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<LegalPage kind="privacy" />} />
          <Route path="terms" element={<LegalPage kind="terms" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password/:token" element={<ResetPasswordPage />} />
        </Route>

        {/* Job seeker area */}
        <Route element={<ProtectedRoute roles={[ROLES.JOB_SEEKER]} />}>
          <Route path="dashboard" element={<SeekerLayout />}>
            <Route index element={<SeekerOverviewPage />} />
            <Route path="applications" element={<MyApplicationsPage />} />
            <Route path="applications/:applicationId" element={<ApplicationDetailPage />} />
            <Route path="saved-jobs" element={<SavedJobsPage />} />
            <Route path="alerts" element={<JobAlertsPage />} />
            <Route path="interviews" element={<InterviewsPage role="JOB_SEEKER" />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="resumes" element={<ResumesPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
          </Route>
        </Route>

        {/* Employer area */}
        <Route element={<ProtectedRoute roles={[ROLES.EMPLOYER]} />}>
          <Route path="employer" element={<EmployerLayout />}>
            <Route path="dashboard" element={<EmployerDashboardPage />} />
            <Route path="jobs" element={<MyJobsPage />} />
            <Route path="jobs/new" element={<PostJobPage />} />
            <Route path="jobs/:jobId/edit" element={<PostJobPage />} />
            <Route path="jobs/:jobId/applicants" element={<ApplicantsPage />} />
            <Route path="applicants" element={<ApplicantsPage />} />
            <Route path="applications/:applicationId" element={<ApplicationReviewPage />} />
            <Route path="interviews" element={<InterviewsPage role="EMPLOYER" />} />
            <Route path="company" element={<CompanyProfilePage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="settings" element={<AccountSettingsPage />} />
          </Route>
        </Route>

        {/* Admin area */}
        <Route element={<ProtectedRoute roles={[ROLES.ADMIN]} />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="job-seekers" element={<AdminUsersPage role="JOB_SEEKER" />} />
            <Route path="employers" element={<AdminEmployersPage />} />
            <Route path="companies" element={<AdminCompaniesPage />} />
            <Route path="jobs" element={<AdminJobsPage />} />
            <Route path="jobs/:jobId/edit" element={<PostJobPage />} />
            <Route path="applications" element={<AdminApplicationsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="locations" element={<AdminLocationsPage />} />
            <Route path="reports" element={<AdminReportsPage />} />
            <Route path="featured-jobs" element={<AdminFeaturedJobsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
