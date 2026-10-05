import { Link } from 'react-router-dom';
import { BadgeCheck, MapPin } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { formatLocation } from '@/utils/format';

export default function CompanyCard({ company }) {
  return (
    <Link to={`/companies/${company._id}`} className="card block p-5 transition hover:border-brand-200 hover:shadow-lift">
      <div className="flex items-center gap-4">
        <Avatar src={company.logo} name={company.name} size="lg" square />
        <div className="min-w-0">
          <h3 className="flex items-center gap-1 text-base font-semibold"><span className="truncate">{company.name}</span>{company.verificationStatus === 'VERIFIED' && <BadgeCheck className="h-4 w-4 shrink-0 text-brand-600" aria-label="Verified" />}</h3>
          <p className="truncate text-sm text-slate-500">{company.industry}</p>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-slate-600"><MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />{formatLocation(company.location)}</span>
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{company.activeJobs ?? 0} open {company.activeJobs === 1 ? 'job' : 'jobs'}</span>
      </div>
    </Link>
  );
}
