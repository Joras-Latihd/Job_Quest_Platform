import { Link } from 'react-router-dom';
import { BadgeCheck, Building2, Globe, MapPin, Users } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import { formatLocation } from '@/utils/format';

export default function CompanySidebar({ company }) {
  const info = company || {};
  return (
    <aside className="card p-5" aria-label="About the company">
      <div className="flex items-center gap-3">
        <Avatar src={info.logo} name={info.name || 'Company'} size="lg" square />
        <div className="min-w-0">
          <h2 className="truncate font-sans text-base font-semibold">{info.name || 'Company'}</h2>
          {info.verificationStatus === 'VERIFIED' && <p className="flex items-center gap-1 text-xs font-medium text-brand-700"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified employer</p>}
        </div>
      </div>
      <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
        {info.industry && <li className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />{info.industry}</li>}
        <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" aria-hidden="true" />{formatLocation(info.location)}</li>
        {info.size && <li className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" aria-hidden="true" />{info.size} employees</li>}
        {info.website && <li className="flex items-center gap-2"><Globe className="h-4 w-4 text-slate-400" aria-hidden="true" /><a href={info.website} target="_blank" rel="noreferrer noopener" className="truncate text-brand-600 hover:underline">{info.website.replace(/^https?:\/\//, '')}</a></li>}
      </ul>
      {info._id && <Button as={Link} to={`/companies/${info._id}`} variant="outline" className="mt-5 w-full">View Company</Button>}
    </aside>
  );
}
