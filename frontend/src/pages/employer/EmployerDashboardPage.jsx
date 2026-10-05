import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Briefcase, CalendarClock, FileText, UserCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import Avatar from '@/components/ui/Avatar';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { companyService } from '@/services/companyService';
import { APPLICATION_STATUSES, JOB_STATUSES } from '@/constants';
import { timeAgo } from '@/utils/format';

export default function EmployerDashboardPage() {
  useDocumentTitle('Employer dashboard');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['employer-dashboard'], queryFn: companyService.dashboard, select: (res) => res.data });
  if (isError) return <ErrorState onRetry={refetch} />;
  const stats = data?.stats || {};
  const company = data?.company;
  const maxApplications = Math.max(1, ...(data?.statusBreakdown || []).map((item) => item.count));

  return (
    <div className="space-y-6">
      <PageHeader title="Employer dashboard" description={company ? company.name : 'Set up your company to start hiring'} actions={<Button as={Link} to="/employer/jobs/new">Post new job</Button>} />

      {!isLoading && !company && (
        <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">You have not created a company profile yet. <Link to="/employer/company" className="font-semibold underline">Create it now</Link> before posting jobs.</div>
      )}
      {company && company.verificationStatus !== 'VERIFIED' && (
        <div role="status" className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">Your company is <strong>{company.verificationStatus?.toLowerCase()}</strong>. {company.verificationStatus === 'PENDING' ? 'An administrator will review it shortly. Jobs you post wait for approval.' : company.verificationNote || ''}</div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active jobs" value={stats.activeJobs} icon={Briefcase} loading={isLoading} />
        <StatCard label="Total applications" value={stats.totalApplications} icon={FileText} tone="purple" loading={isLoading} />
        <StatCard label="Shortlisted" value={stats.shortlisted} icon={UserCheck} tone="green" loading={isLoading} />
        <StatCard label="Interviews" value={stats.interviews} icon={CalendarClock} tone="amber" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-sans text-base font-semibold">Recent applicants</h2><Link to="/employer/applicants" className="text-sm font-medium text-brand-600 hover:underline">View all</Link></div>
          {isLoading ? <Skeleton className="h-40" /> : data.recentApplicants?.length ? (
            <ul className="divide-y divide-slate-100">
              {data.recentApplicants.map((application) => (
                <li key={application._id} className="flex items-center gap-3 py-3">
                  <Avatar src={application.candidate?.profileImage} name={application.candidate?.name} size="md" />
                  <div className="min-w-0 flex-1"><Link to={`/employer/applications/${application._id}`} className="block truncate text-sm font-medium hover:text-brand-600">{application.candidate?.name}</Link><p className="truncate text-xs text-slate-500">{application.job?.title} &middot; {timeAgo(application.appliedAt)}</p></div>
                  <StatusBadge status={application.status} options={APPLICATION_STATUSES} />
                </li>
              ))}
            </ul>
          ) : <p className="py-6 text-center text-sm text-slate-500">No applicants yet. Applications will appear here once your jobs are live.</p>}
        </section>

        <section className="card p-5">
          <h2 className="mb-3 font-sans text-base font-semibold">Application statistics</h2>
          {isLoading ? <Skeleton className="h-40" /> : (
            <ul className="space-y-3">
              {(data.statusBreakdown || []).map((item) => (
                <li key={item.status}>
                  <div className="flex justify-between text-sm"><StatusBadge status={item.status} options={APPLICATION_STATUSES} /><span className="font-medium">{item.count}</span></div>
                  <div className="mt-1 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand-500" style={{ width: `${(item.count / maxApplications) * 100}%` }} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="card p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-sans text-base font-semibold">Recent jobs and performance</h2><Link to="/employer/jobs" className="text-sm font-medium text-brand-600 hover:underline">Manage jobs</Link></div>
        {isLoading ? <Skeleton className="h-32" /> : data.recentJobs?.length ? (
          <ul className="divide-y divide-slate-100">
            {data.recentJobs.map((job) => (
              <li key={job._id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="min-w-0"><Link to={`/employer/jobs/${job._id}/applicants`} className="font-medium hover:text-brand-600">{job.title}</Link></span>
                <span className="flex items-center gap-4 text-slate-500"><span>{job.views ?? 0} views</span><span>{job.applicationsCount ?? 0} applications</span><StatusBadge status={job.status} options={JOB_STATUSES} /></span>
              </li>
            ))}
          </ul>
        ) : <p className="py-6 text-center text-sm text-slate-500">You have not posted any jobs yet.</p>}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
          <Button as={Link} to="/employer/jobs/new" size="sm">Post new job</Button>
          <Button as={Link} to="/employer/jobs" variant="outline" size="sm">Manage jobs</Button>
          <Button as={Link} to="/employer/applicants" variant="outline" size="sm">View applicants</Button>
          <Button as={Link} to="/employer/company" variant="outline" size="sm">Edit company profile</Button>
        </div>
      </section>
    </div>
  );
}
