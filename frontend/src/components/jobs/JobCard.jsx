import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Banknote, BadgeCheck, CalendarX2, Sparkles } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SaveJobButton from '@/components/common/SaveJobButton';
import { WORKPLACE_TYPES, JOB_TYPES } from '@/constants';
import { deadlineLabel, formatExperience, formatLocation, formatSalary, labelFor, timeAgo } from '@/utils/format';

export default function JobCard({ job }) {
  const company = job.company || {};
  return (
    <article className="card min-w-0 p-4 transition hover:border-brand-200 hover:shadow-lift sm:p-5">
      <div className="flex items-start gap-3 sm:gap-4">
        <Avatar src={company.logo} name={company.name} size="lg" square />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {job.isFeatured && <Badge tone="amber" icon={Sparkles}>Featured</Badge>}
            {job.isUrgent && <Badge tone="red">Urgent hiring</Badge>}
            {typeof job.matchScore === 'number' && <Badge tone="green">{job.matchScore}% match</Badge>}
          </div>
          <h3 className="line-clamp-2 text-lg font-semibold leading-snug">
            <Link to={`/jobs/${job._id}`} className="break-words hover:text-brand-600">{job.title}</Link>
          </h3>
          <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-600">
            <span className="truncate">{company.name}</span>
            {company.verificationStatus === 'VERIFIED' && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label="Verified employer" />}
          </p>
        </div>
        <span className="shrink-0"><SaveJobButton job={job} /></span>
      </div>

      <ul className="mt-4 grid grid-cols-1 gap-x-4 gap-y-2 text-sm text-slate-600 min-[420px]:grid-cols-2">
        <li className="flex min-w-0 items-center gap-2"><MapPin className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="min-w-0 truncate">{formatLocation(job.location)}{job.workplaceType === 'REMOTE' ? ' (Remote)' : ''}</span></li>
        <li className="flex min-w-0 items-center gap-2"><Briefcase className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="min-w-0 truncate">{labelFor(JOB_TYPES, job.jobType)} &middot; {labelFor(WORKPLACE_TYPES, job.workplaceType)}</span></li>
        <li className="flex min-w-0 items-center gap-2"><Clock className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="min-w-0 truncate">{formatExperience(job.experience)}</span></li>
        <li className="flex min-w-0 items-center gap-2"><Banknote className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" /><span className="min-w-0 truncate">{formatSalary(job.salary)}</span></li>
      </ul>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
        <p className="flex min-w-0 flex-wrap items-center gap-x-3 text-xs text-slate-500">
          <span className="truncate">Posted {timeAgo(job.publishedAt || job.createdAt)}</span>
          <span className="flex items-center gap-1"><CalendarX2 className="h-3.5 w-3.5" aria-hidden="true" />{deadlineLabel(job.deadline)}</span>
        </p>
        <Button as={Link} to={`/jobs/${job._id}`} variant="secondary" size="sm" className="w-full min-[420px]:w-auto">View Job</Button>
      </div>
    </article>
  );
}
