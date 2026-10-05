import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Bookmark, CalendarClock, FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Button from '@/components/ui/Button';
import JobCard from '@/components/jobs/JobCard';
import ProfileCompletion from '@/components/common/ProfileCompletion';
import useAuth from '@/hooks/useAuth';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { userService } from '@/services/userService';
import { APPLICATION_STATUSES } from '@/constants';
import { formatDate, formatLocation, timeAgo } from '@/utils/format';

function Panel({ title, linkTo, linkLabel, children }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-center justify-between"><h2 className="font-sans text-base font-semibold">{title}</h2>{linkTo && <Link to={linkTo} className="text-sm font-medium text-brand-600 hover:underline">{linkLabel}</Link>}</div>
      {children}
    </section>
  );
}

export default function SeekerOverviewPage() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['seeker-dashboard'], queryFn: userService.dashboard, select: (res) => res.data });

  if (isError) return <ErrorState onRetry={refetch} />;
  const stats = data?.stats || {};

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} description="Here is what is happening with your job search." actions={<Button as={Link} to="/find-jobs">Find jobs</Button>} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Applications" value={stats.applications} icon={FileText} loading={isLoading} />
        <StatCard label="Saved jobs" value={stats.savedJobs} icon={Bookmark} tone="purple" loading={isLoading} />
        <StatCard label="Interviews" value={stats.interviews} icon={CalendarClock} tone="amber" loading={isLoading} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Recent applications" linkTo="/dashboard/applications" linkLabel="View all">
            {isLoading ? <Skeleton className="h-32" /> : data.recentApplications?.length ? (
              <ul className="divide-y divide-slate-100">
                {data.recentApplications.map((application) => (
                  <li key={application._id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0"><Link to={`/dashboard/applications/${application._id}`} className="block truncate text-sm font-medium hover:text-brand-600">{application.job?.title}</Link><p className="truncate text-xs text-slate-500">{application.job?.company?.name} &middot; {timeAgo(application.appliedAt)}</p></div>
                    <StatusBadge status={application.status} options={APPLICATION_STATUSES} />
                  </li>
                ))}
              </ul>
            ) : <EmptyState icon={FileText} title="No applications yet" description="Find a job and start your application." action={<Button as={Link} to="/find-jobs" size="sm">Browse jobs</Button>} />}
          </Panel>

          <section aria-labelledby="recommended-title">
            <h2 id="recommended-title" className="font-sans text-base font-semibold">Recommended for you</h2>
            <p className="mb-3 text-sm text-slate-500">Based on your skills and preferences. The match percentage is a platform-generated relevance score, not a hiring prediction.</p>
            {isLoading ? <Skeleton className="h-40" /> : data.recommendedJobs?.length ? <div className="space-y-4">{data.recommendedJobs.map((job) => <JobCard key={job._id} job={job} />)}</div> : <EmptyState title="No recommendations yet" description="Add skills and preferences to your profile to see matching jobs." action={<Button as={Link} to="/dashboard/profile" size="sm">Update profile</Button>} />}
          </section>
        </div>

        <div className="space-y-6">
          <ProfileCompletion user={user} />
          <Panel title="Upcoming interviews" linkTo="/dashboard/interviews" linkLabel="All">
            {isLoading ? <Skeleton className="h-20" /> : data.upcomingInterviews?.length ? (
              <ul className="space-y-3 text-sm">{data.upcomingInterviews.map((interview) => <li key={interview._id}><p className="font-medium">{interview.job?.title}</p><p className="text-xs text-slate-500">{formatDate(interview.scheduledAt, true)}</p></li>)}</ul>
            ) : <p className="text-sm text-slate-500">No interviews scheduled.</p>}
          </Panel>
          <Panel title="Saved jobs" linkTo="/dashboard/saved-jobs" linkLabel="All">
            {isLoading ? <Skeleton className="h-20" /> : data.savedJobs?.length ? (
              <ul className="space-y-3 text-sm">{data.savedJobs.map((job) => <li key={job._id}><Link to={`/jobs/${job._id}`} className="block truncate font-medium hover:text-brand-600">{job.title}</Link><p className="truncate text-xs text-slate-500">{job.company?.name} &middot; {formatLocation(job.location)}</p></li>)}</ul>
            ) : <p className="text-sm text-slate-500">You have not saved any jobs yet.</p>}
          </Panel>
          <Panel title="Job alerts" linkTo="/dashboard/alerts" linkLabel="Manage">
            <p className="text-sm text-slate-600">{data?.alerts ? `${data.alerts} active alert${data.alerts === 1 ? '' : 's'}.` : 'Get notified when new matching jobs are posted.'}</p>
          </Panel>
        </div>
      </div>
    </div>
  );
}
