import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { JOB_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

/*
 * Shown above the job when it is not a normal open listing:
 *  - to the employer / admin who can manage it (draft, pending, rejected ...)
 *  - to the public when a shared link points to a closed or expired job
 */
export default function JobStatusBanner({ job, user, isManager }) {
  const expiredByDate = job.deadline && new Date(job.deadline) < new Date();
  const isLive = job.status === 'PUBLISHED' && !expiredByDate;
  if (isLive && !isManager) return null;

  if (!isManager) {
    return (
      <div role="status" className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <Info className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>This job is no longer accepting applications{job.deadline ? ` (deadline was ${formatDate(job.deadline)})` : ''}. Browse similar openings below or <Link to="/find-jobs" className="font-semibold underline">search all jobs</Link>.</p>
      </div>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const editPath = isAdmin ? `/admin/jobs/${job._id}/edit` : `/employer/jobs/${job._id}/edit`;
  const notes = {
    DRAFT: 'This is a draft. Only you can see it. Submit it to start the approval process.',
    PENDING_APPROVAL: 'This job is waiting for admin approval and is not public yet.',
    REJECTED: 'This job was rejected and is not public.',
    CLOSED: 'This job is closed and no longer accepts applications.',
    EXPIRED: 'This job has passed its deadline.',
    PUBLISHED: expiredByDate ? 'The deadline has passed, so applications are closed.' : 'This job is live. Visitors see the page exactly as shown below.',
  };

  return (
    <div role="status" className="mb-5 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-semibold">{isAdmin ? 'Admin preview' : 'Employer preview'}</span>
        <StatusBadge status={job.status} options={JOB_STATUSES} />
        <span>{notes[job.status]}</span>
      </div>
      {job.status === 'REJECTED' && job.rejectionReason && <p className="mt-2 rounded-lg bg-white/70 p-2 text-red-700">Reason: {job.rejectionReason}</p>}
      <div className="mt-3 flex flex-wrap gap-2">
        <Button as={Link} to={editPath} size="sm" variant="outline">Edit job</Button>
        {!isAdmin && <Button as={Link} to={`/employer/jobs/${job._id}/applicants`} size="sm" variant="outline">View applicants ({job.applicationsCount ?? 0})</Button>}
        {isAdmin && <Button as={Link} to={`/admin/jobs/${job._id}`} size="sm">Open moderation view</Button>}
      </div>
    </div>
  );
}
