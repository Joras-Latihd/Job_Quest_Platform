import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Building2, CalendarDays, Globe, MapPin, Users } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import JobCard from '@/components/jobs/JobCard';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { companyService } from '@/services/companyService';
import { jobService } from '@/services/jobService';
import { formatLocation } from '@/utils/format';

export default function CompanyDetailsPage() {
  const { companyId } = useParams();
  const { data: company, isLoading, isError, error, refetch } = useQuery({ queryKey: ['company', companyId], queryFn: () => companyService.getById(companyId), select: (res) => res.data });
  const jobsQuery = useQuery({ queryKey: ['jobs', 'company', companyId], queryFn: () => jobService.list({ company: companyId, limit: 20 }), select: (res) => res.data });
  useDocumentTitle(company?.name || 'Company');

  if (isLoading) return <div className="container-page space-y-4 py-8"><Skeleton className="h-48" /><Skeleton className="h-40" /></div>;
  if (isError) return <div className="container-page py-12"><ErrorState message={error.message} onRetry={refetch} /></div>;

  const details = [
    [Building2, company.industry], [MapPin, formatLocation(company.location)], [Users, company.size && `${company.size} employees`],
    [CalendarDays, company.foundedYear && `Founded ${company.foundedYear}`],
  ].filter(([, text]) => text);
  const socials = Object.entries(company.socialLinks || {}).filter(([, href]) => href);

  return (
    <div>
      <div className="h-40 bg-gradient-to-r from-brand-700 to-brand-500 sm:h-56">
        {company.coverImage && <img src={company.coverImage} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="container-page">
        <div className="card -mt-12 flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-6">
          <Avatar src={company.logo} name={company.name} size="xl" square className="-mt-14 border-4 border-white shadow sm:mt-0" />
          <div className="min-w-0">
            <h1 className="flex flex-wrap items-center gap-2 text-2xl font-bold">{company.name}{company.verificationStatus === 'VERIFIED' && <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 font-sans text-xs font-medium text-brand-700"><BadgeCheck className="h-4 w-4" aria-hidden="true" /> Verified</span>}</h1>
            <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
              {details.map(([Icon, text]) => <li key={text} className="flex items-center gap-1.5"><Icon className="h-4 w-4 text-slate-400" aria-hidden="true" />{text}</li>)}
              {company.website && <li className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-slate-400" aria-hidden="true" /><a href={company.website} target="_blank" rel="noreferrer noopener" className="text-brand-600 hover:underline">Website</a></li>}
            </ul>
            {socials.length > 0 && <p className="mt-2 flex gap-4 text-sm">{socials.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer noopener" className="capitalize text-brand-600 hover:underline">{name}</a>)}</p>}
          </div>
        </div>

        <div className="mt-6 grid gap-6 pb-4 lg:grid-cols-[1fr_22rem]">
          <section aria-labelledby="open-positions">
            <h2 id="open-positions" className="mb-4 text-xl font-bold">Open positions ({jobsQuery.data?.length ?? 0})</h2>
            {jobsQuery.isLoading ? <Skeleton className="h-40" /> : jobsQuery.data?.length ? <div className="space-y-4">{jobsQuery.data.map((job) => <JobCard key={job._id} job={{ ...job, company }} />)}</div> : <EmptyState title="No open positions" description="This company has no active jobs right now. Check back soon." />}
          </section>
          <section className="card h-fit p-5" aria-labelledby="about-company">
            <h2 id="about-company" className="mb-3 text-lg font-semibold">About {company.name}</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{company.description}</p>
          </section>
        </div>
      </div>
    </div>
  );
}
