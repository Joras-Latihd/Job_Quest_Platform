import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, Eye, Flag, Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ReasonDialog from '@/components/ui/ReasonDialog';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import JobContent from '@/components/jobs/details/JobContent';
import JobSummaryBar from '@/components/jobs/details/JobSummaryBar';
import CompanySidebar from '@/components/jobs/details/CompanySidebar';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { APPLICATION_STATUSES, JOB_STATUSES, REPORT_REASONS, REPORT_STATUSES } from '@/constants';
import { formatDate, labelFor, timeAgo } from '@/utils/format';

function AdminJobDetail() {
  useDocumentTitle('Job details');
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [dialog, setDialog] = useState(null); // approve | reject | hide | close | delete

  const jobQuery = useQuery({ queryKey: ['admin', 'job', jobId], queryFn: () => jobService.getById(jobId), select: (res) => res.data });
  // The backend filters by ?job=; the extra client filter keeps this correct even on an older backend.
  const reportsQuery = useQuery({
    queryKey: ['admin', 'job-reports', jobId],
    queryFn: () => adminService.reports({ job: jobId, limit: 20 }),
    select: (res) => (res.data || []).filter((report) => String(report.job?._id) === String(jobId)),
    retry: false,
  });
  const applicantsQuery = useQuery({ queryKey: ['admin', 'job-applicants', jobId], queryFn: () => applicationService.forJob(jobId, { limit: 5 }), retry: false });

  const refresh = [['admin', 'job'], ['admin', 'jobs'], ['admin', 'job-reports'], ['job'], ['jobs'], ['admin', 'dashboard']];
  const close = () => setDialog(null);
  const approve = useActionMutation(() => adminService.approveJob(jobId), { success: 'Job approved and published.', invalidate: refresh, onSuccess: close });
  const reject = useActionMutation((reason) => adminService.rejectJob(jobId, { reason }), { success: 'Job rejected. The employer has been notified.', invalidate: refresh, onSuccess: close });
  const setStatus = useActionMutation((status) => jobService.updateStatus(jobId, { status }), { success: 'Job updated.', invalidate: refresh, onSuccess: close });
  const feature = useActionMutation((isFeatured) => jobService.feature(jobId, { isFeatured }), { success: 'Featured status updated.', invalidate: refresh });
  const remove = useActionMutation(() => jobService.remove(jobId), { success: 'Job deleted.', invalidate: refresh, onSuccess: () => navigate('/admin/jobs') });

  if (jobQuery.isError) return <ErrorState message={jobQuery.error.message} onRetry={jobQuery.refetch} />;
  if (jobQuery.isLoading) return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-96" /></div>;

  const job = jobQuery.data;
  const reports = reportsQuery.data || [];
  const applicants = applicantsQuery.data?.data || [];
  const pending = ['PENDING_APPROVAL', 'REJECTED'].includes(job.status);

  return (
    <div className="space-y-6">
      <PageHeader
        title={job.title}
        description={`${job.company?.name || 'Company'} - ${job.category?.name || 'No category'}`}
        actions={(
          <>
            <Button as={Link} to="/admin/jobs" variant="outline">Back to jobs</Button>
            <Button as={Link} to={`/admin/jobs/${jobId}/edit`} variant="outline">Edit</Button>
            {job.status === 'PUBLISHED' && <Button as={Link} to={`/jobs/${jobId}`} variant="outline">Public page</Button>}
          </>
        )}
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Views" value={job.views} icon={Eye} />
        <StatCard label="Applications" value={job.applicationsCount} icon={Users} tone="purple" />
        <StatCard label="Reports" value={reportsQuery.isLoading ? '...' : reports.length} icon={Flag} tone={reports.length ? 'red' : 'green'} />
        <StatCard label="Deadline" value={formatDate(job.deadline)} icon={CalendarClock} tone="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <JobSummaryBar job={job} />
          <JobContent job={job} />
        </div>

        <div className="space-y-5">
          <section className="card p-5" aria-labelledby="moderation-title">
            <h2 id="moderation-title" className="font-sans text-base font-semibold">Moderation</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={job.status} options={JOB_STATUSES} />
              {job.isFeatured && <Badge tone="amber">Featured</Badge>}
              {job.isUrgent && <Badge tone="red">Urgent</Badge>}
              {job.featureRequested && !job.isFeatured && <Badge>Feature requested</Badge>}
            </div>
            {job.status === 'REJECTED' && job.rejectionReason && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">Rejected: {job.rejectionReason}</p>}
            <div className="mt-4 flex flex-col gap-2">
              {pending && <Button onClick={() => setDialog('approve')}>Approve and publish</Button>}
              {job.status !== 'REJECTED' && <Button variant="outline" className="!text-red-600" onClick={() => setDialog('reject')}>Reject</Button>}
              {job.status === 'PUBLISHED' && (
                <>
                  <Button variant="outline" onClick={() => feature.mutate(!job.isFeatured)} loading={feature.isPending}>{job.isFeatured ? 'Remove from featured' : 'Feature this job'}</Button>
                  <Button variant="outline" onClick={() => setDialog('hide')}>Hide (back to pending)</Button>
                  <Button variant="outline" onClick={() => setDialog('close')}>Close job</Button>
                </>
              )}
              <Button variant="ghost" className="!text-red-600" onClick={() => setDialog('delete')}>Delete job</Button>
            </div>
          </section>

          <CompanySidebar company={job.company} />

          <section className="card p-5" aria-labelledby="reports-title">
            <div className="flex items-center justify-between"><h2 id="reports-title" className="font-sans text-base font-semibold">Reports on this job</h2><Link to="/admin/reports" className="text-sm font-medium text-brand-600 hover:underline">All reports</Link></div>
            {reportsQuery.isLoading ? <Skeleton className="mt-3 h-16" /> : reports.length === 0 ? <p className="mt-3 text-sm text-slate-500">No one has reported this job.</p> : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {reports.map((report) => (
                  <li key={report._id} className="py-2.5">
                    <div className="flex items-center justify-between gap-2"><span className="font-medium">{labelFor(REPORT_REASONS, report.reason)}</span><StatusBadge status={report.status} options={REPORT_STATUSES} /></div>
                    {report.details && <p className="mt-1 text-slate-600">{report.details}</p>}
                    <p className="text-xs text-slate-400">{report.reporter?.name} &middot; {timeAgo(report.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="card p-5" aria-labelledby="applicants-title">
            <h2 id="applicants-title" className="font-sans text-base font-semibold">Recent applicants</h2>
            {applicantsQuery.isLoading ? <Skeleton className="mt-3 h-16" /> : applicants.length === 0 ? <p className="mt-3 text-sm text-slate-500">No applications yet.</p> : (
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {applicants.map((application) => (
                  <li key={application._id} className="flex items-center justify-between gap-2 py-2.5">
                    <span className="min-w-0"><span className="block truncate font-medium">{application.candidate?.name}</span><span className="text-xs text-slate-400">{timeAgo(application.appliedAt)}</span></span>
                    <StatusBadge status={application.status} options={APPLICATION_STATUSES} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ConfirmDialog open={dialog === 'approve'} title="Approve this job?" message={`"${job.title}" will become public and appear in search.`} confirmLabel="Approve" loading={approve.isPending} onConfirm={() => approve.mutate()} onCancel={close} />
      <ReasonDialog open={dialog === 'reject'} title="Reject job" description="The employer will see this reason and can edit and resubmit." confirmLabel="Reject job" loading={reject.isPending} onConfirm={(reason) => reject.mutate(reason)} onCancel={close} />
      <ConfirmDialog open={dialog === 'hide'} title="Hide this job?" message="It returns to pending approval and disappears from public search until approved again." confirmLabel="Hide" loading={setStatus.isPending} onConfirm={() => setStatus.mutate('PENDING_APPROVAL')} onCancel={close} />
      <ConfirmDialog open={dialog === 'close'} title="Close this job?" message="The job stops accepting applications." confirmLabel="Close job" loading={setStatus.isPending} onConfirm={() => setStatus.mutate('CLOSED')} onCancel={close} />
      <ConfirmDialog open={dialog === 'delete'} title="Delete this job?" message={`"${job.title}" and all of its applications will be permanently removed.`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate()} onCancel={close} />
    </div>
  );
}

export default function AdminJobDetailPage() {
  const { jobId } = useParams();
  return <ErrorBoundary resetKey={jobId}><AdminJobDetail /></ErrorBoundary>;
}
