import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BadgeCheck, Flag, MapPin } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SaveJobButton from '@/components/common/SaveJobButton';
import ShareMenu from '@/components/common/ShareMenu';
import ApplyAction from './ApplyAction';
import useAuth from '@/hooks/useAuth';
import { formatLocation, timeAgo } from '@/utils/format';

export default function JobHeader({ job, onApply, onReport }) {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const company = job.company || {};

  const handleReport = () => {
    if (!isLoggedIn) return navigate('/login', { state: { from: location } });
    return onReport();
  };

  return (
    <section className="card p-5 sm:p-7" aria-labelledby="job-title">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar src={company.logo} name={company.name || 'Company'} size="xl" square />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {job.isFeatured && <Badge tone="amber">Featured</Badge>}
            {job.isUrgent && <Badge tone="red">Urgent hiring</Badge>}
            {typeof job.matchScore === 'number' && <Badge tone="green">{job.matchScore}% match</Badge>}
          </div>
          <h1 id="job-title" className="text-2xl font-bold sm:text-3xl">{job.title}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-1.5 text-slate-600">
            {company._id ? <Link to={`/companies/${company._id}`} className="font-medium hover:text-brand-600">{company.name}</Link> : <span className="font-medium">{company.name || 'Company'}</span>}
            {company.verificationStatus === 'VERIFIED' && <BadgeCheck className="h-5 w-5 text-brand-600" aria-label="Verified employer" />}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" aria-hidden="true" />{formatLocation(job.location)}</span>
            <span>Posted {timeAgo(job.publishedAt || job.createdAt)}</span>
            <span>{job.views ?? 0} views</span>
            <span>{job.applicationsCount ?? 0} applicants</span>
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
        <ApplyAction job={job} onApply={onApply} />
        <SaveJobButton job={job} withLabel />
        <ShareMenu title={`${job.title} at ${company.name || 'Job Quest'}`} />
        <Button variant="ghost" onClick={handleReport}><Flag className="h-4 w-4" aria-hidden="true" /> Report</Button>
      </div>
    </section>
  );
}
