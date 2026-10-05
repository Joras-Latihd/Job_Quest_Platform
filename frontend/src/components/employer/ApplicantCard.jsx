import { Link } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import { APPLICATION_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

// Quick status actions shown on each card. Full controls are on the review page.
const QUICK_ACTIONS = [
  { status: 'SHORTLISTED', label: 'Shortlist' },
  { status: 'INTERVIEW', label: 'Interview' },
  { status: 'SELECTED', label: 'Select' },
  { status: 'REJECTED', label: 'Reject', danger: true },
];

export default function ApplicantCard({ application, onStatusChange, busy }) {
  const candidate = application.candidate || {};
  const education = candidate.education?.[0];
  return (
    <article className="card p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <Avatar src={candidate.profileImage} name={candidate.name} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-sans text-base font-semibold">{candidate.name}</h3>
            <StatusBadge status={application.status} options={APPLICATION_STATUSES} />
          </div>
          <p className="truncate text-sm text-slate-600">{candidate.headline || 'No headline'}</p>
          {application.job?.title && <p className="text-xs text-slate-500">Applied for {application.job.title}</p>}
          <p className="mt-1 text-xs text-slate-500">
            {candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} yrs experience` : 'Experience not listed'}
            {education ? ` - ${education.degree}, ${education.institution}` : ''} &middot; applied {formatDate(application.appliedAt)}
          </p>
          {candidate.skills?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{candidate.skills.slice(0, 6).map((skill) => <Badge key={skill} tone="blue">{skill}</Badge>)}</div>}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <Button as={Link} to={`/employer/applications/${application._id}`} size="sm"><Eye className="h-4 w-4" aria-hidden="true" /> View application</Button>
        {application.resume?.url && <Button as="a" href={application.resume.url} target="_blank" rel="noreferrer noopener" variant="outline" size="sm"><Download className="h-4 w-4" aria-hidden="true" /> Resume</Button>}
        {application.status !== 'WITHDRAWN' && QUICK_ACTIONS.filter((action) => action.status !== application.status).map((action) => (
          <Button key={action.status} variant="ghost" size="sm" className={action.danger ? '!text-red-600' : ''} disabled={busy} onClick={() => onStatusChange(application._id, action.status)}>{action.label}</Button>
        ))}
      </div>
    </article>
  );
}
