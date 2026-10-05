import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import { companyService } from '@/services/companyService';

export default function TrustedCompanies() {
  const { data: companies = [] } = useQuery({ queryKey: ['companies', 'trusted'], queryFn: () => companyService.list({ verified: true, limit: 8, sort: '-activeJobs' }), select: (res) => res.data });
  if (!companies.length) return null;
  return (
    <section className="container-page py-14" aria-labelledby="companies-title">
      <div className="mb-8 flex items-end justify-between gap-4">
        <h2 id="companies-title" className="section-title">Companies hiring now</h2>
        <Link to="/companies" className="text-sm font-medium text-brand-600 hover:underline">All companies</Link>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {companies.map((company) => (
          <li key={company._id}>
            <Link to={`/companies/${company._id}`} className="card flex flex-col items-center gap-2 p-4 text-center transition hover:shadow-lift">
              <Avatar src={company.logo} name={company.name} size="lg" square />
              <span className="line-clamp-1 text-sm font-medium">{company.name}</span>
              <span className="text-xs text-slate-500">{company.activeJobs ?? 0} open jobs</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
