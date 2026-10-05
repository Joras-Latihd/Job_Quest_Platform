import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Banknote, CalendarClock, BadgeCheck, Flag } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StatusBadge from '@/components/ui/StatusBadge';
import SaveJobButton from '@/components/common/SaveJobButton';
import ShareMenu from '@/components/common/ShareMenu';
import useAuth from '@/hooks/useAuth';
import { JOB_STATUSES, JOB_TYPES, WORKPLACE_TYPES } from '@/constants';
import { deadlineLabel, formatDate, formatExperience, formatLocation, formatSalary, labelFor, timeAgo } from '@/utils/format';

export default function JobHeader({ job, onApply, onReport }) {
  const { isLoggedIn, isSeeker } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const company = job.company || {};
  const isOpen = job.status === 'PUBLISHED' && (!job.deadline || new Date(job.deadline) > new Date());

  const handleApply = () => {
    if (!isLoggedIn) return navigate('/login', { state: { from: location } });
    return onApply();
  };
  const handleReport = () => {
    if (!isLoggedIn) return navigate('/login', { state: { from: location } });
    return onReport();
  };

  let applyButton = <Button size="lg" onClick={handleApply}>Apply Now</Button>;
  if (job.applicationMethod && job.applicationMethod !== 'PLATFORM') {
    applyButton = <Button as="a" size="lg" href={job.applicationMethod === 'EMAIL' ? `mailto:${job.applicationUrl}` : job.applicationUrl} target="_blank" rel="noreferrer noopener">Apply Now</Button>;
  } else if (isLoggedIn && !isSeeker) {
    applyButton = <Button size="lg" disabled>Only job seekers can apply</Button>;
  } else if (job.hasApplied) {
    applyButton = <Button size="lg" variant="secondary" disabled>Already applied</Button>;
  }
  if (!isOpen) applyButton = <Button size="lg" disabled>Applications closed</Button>;

  return (
    <section className="card p-5 sm:p-7" aria-labelledby="job-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar src={company.logo} name={company.name} size="xl" square />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {job.isFeatured && <Badge tone="amber">Featured</Badge>}
            {job.isUrgent && <Badge tone="red">Urgent hiring</Badge>}
            <StatusBadge status={job.status} options={JOB_STATUSES} />
            {typeof job.matchScore === 'number' && <Badge tone="green">{job.matchScore}% match</Badge>}
          </div>
          <h1 id="job-title" className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-slate-600">
            <Link to={`/companies/${company._id}`} className="font-medium hover:text-brand-600">{company.name}</Link>
            {company.verificationStatus === 'VERIFIED' && <BadgeCheck className="h-5 w-5 text-brand-600" aria-label="Verified employer" />}
          </p>
          <ul className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />{formatLocation(job.location)}</li>
            <li className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-slate-400" aria-hidden="true" />{labelFor(JOB_TYPES, job.jobType)} &middot; {labelFor(WORKPLACE_TYPES, job.workplaceType)}</li>
            <li className="flex items-center gap-2"><Clock className="h-4 w-4 text-slate-400" aria-hidden="true" />{formatExperience(job.experience)} experience</li>
            <li className="flex items-center gap-2"><Banknote className="h-4 w-4 text-slate-400" aria-hidden="true" />{formatSalary(job.salary)}</li>
            <li className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-slate-400" aria-hidden="true" />Deadline {formatDate(job.deadline)} ({deadlineLabel(job.deadline)})</li>
            <li className="text-slate-500">Posted {timeAgo(job.publishedAt || job.createdAt)} &middot; {job.views ?? 0} views</li>
          </ul>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
        {applyButton}
        <SaveJobButton job={job} withLabel />
        <ShareMenu title={`${job.title} at ${company.name}`} />
        <Button variant="ghost" onClick={handleReport}><Flag className="h-4 w-4" aria-hidden="true" /> Report</Button>
      </div>
    </section>
  );
}
