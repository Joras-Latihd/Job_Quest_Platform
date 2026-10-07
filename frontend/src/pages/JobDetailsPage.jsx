import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SearchX } from 'lucide-react';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ReportJobModal from '@/components/common/ReportJobModal';
import JobHeader from '@/components/jobs/details/JobHeader';
import JobSummaryBar from '@/components/jobs/details/JobSummaryBar';
import JobContent from '@/components/jobs/details/JobContent';
import JobStatusBanner from '@/components/jobs/details/JobStatusBanner';
import ApplyCard from '@/components/jobs/details/ApplyCard';
import CompanySidebar from '@/components/jobs/details/CompanySidebar';
import RelatedJobs from '@/components/jobs/details/RelatedJobs';
import ApplyModal from '@/components/jobs/details/ApplyModal';
import MobileApplyBar from '@/components/jobs/details/MobileApplyBar';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import useAuth from '@/hooks/useAuth';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { jobService } from '@/services/jobService';
import { formatLocation } from '@/utils/format';

const EMPLOYMENT_TYPES = { FULL_TIME: 'FULL_TIME', PART_TIME: 'PART_TIME', CONTRACT: 'CONTRACTOR', INTERNSHIP: 'INTERN', FREELANCE: 'CONTRACTOR', TEMPORARY: 'TEMPORARY' };
const SALARY_UNITS = { MONTHLY: 'MONTH', YEARLY: 'YEAR', DAILY: 'DAY', HOURLY: 'HOUR' };

// Adds schema.org JobPosting data so search engines can understand the listing (SEO).
function useJobPostingSchema(job) {
  useEffect(() => {
    if (!job || job.status !== 'PUBLISHED') return undefined;
    const data = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      datePosted: job.publishedAt || job.createdAt,
      validThrough: job.deadline,
      employmentType: EMPLOYMENT_TYPES[job.jobType],
      hiringOrganization: { '@type': 'Organization', name: job.company?.name, sameAs: job.company?.website },
      jobLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: formatLocation(job.location), addressCountry: job.location?.country || 'NP' } },
      jobLocationType: job.workplaceType === 'REMOTE' ? 'TELECOMMUTE' : undefined,
      baseSalary: job.salary?.min || job.salary?.max ? {
        '@type': 'MonetaryAmount', currency: job.salary.currency || 'NPR',
        value: { '@type': 'QuantitativeValue', minValue: job.salary.min, maxValue: job.salary.max, unitText: SALARY_UNITS[job.salary.period] || 'MONTH' },
      } : undefined,
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
    return () => script.remove();
  }, [job]);
}

function JobDetailsContent() {
  const { jobId } = useParams();
  const { user, isLoggedIn } = useAuth();
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const { data: job, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['job', jobId],
    queryFn: () => jobService.getById(jobId),
    select: (response) => response.data,
    retry: (count, err) => err.status !== 404 && count < 1,
  });
  useDocumentTitle(job ? `${job.title} at ${job.company?.name || 'Job Quest'}` : 'Job details');
  useJobPostingSchema(job);

  if (isLoading) {
    return <div className="container-page space-y-5 py-8"><Skeleton className="h-8 w-64" /><Skeleton className="h-56" /><Skeleton className="h-72" /></div>;
  }
  if (isError) {
    if (error.status === 404) {
      return (
        <div className="container-page py-12">
          <EmptyState icon={SearchX} title="This job is not available" description="It may have been removed, closed by the employer, or the link is incorrect." action={<Button as={Link} to="/find-jobs">Browse all jobs</Button>} />
        </div>
      );
    }
    return <div className="container-page py-12"><ErrorState message={error.message} onRetry={refetch} /></div>;
  }

  const isManager = isLoggedIn && (user.role === 'ADMIN' || String(job.postedBy) === String(user._id));
  const openApply = () => setApplyOpen(true);
  const openReport = () => setReportOpen(true);

  return (
    <div className="container-page py-6 pb-28 sm:py-8 lg:pb-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li><Link to="/" className="hover:text-brand-600">Home</Link></li><li aria-hidden="true">/</li>
          <li><Link to="/find-jobs" className="hover:text-brand-600">Find jobs</Link></li><li aria-hidden="true">/</li>
          <li aria-current="page" className="max-w-[16rem] truncate text-slate-700">{job.title}</li>
        </ol>
      </nav>

      <JobStatusBanner job={job} user={user} isManager={isManager} />
      <JobHeader job={job} onApply={openApply} onReport={openReport} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_21rem]">
        <div className="space-y-5">
          <JobSummaryBar job={job} />
          <JobContent job={job} onReport={openReport} />
        </div>
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <ApplyCard job={job} onApply={openApply} />
          <CompanySidebar company={job.company} />
          <RelatedJobs jobId={job._id} />
        </div>
      </div>

      {!isManager && <MobileApplyBar job={job} onApply={openApply} />}
      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} job={job} />
      <ReportJobModal open={reportOpen} onClose={() => setReportOpen(false)} job={job} />
    </div>
  );
}

// The boundary turns any unexpected crash into a readable message instead of a blank page.
export default function JobDetailsPage() {
  const { jobId } = useParams();
  return <ErrorBoundary resetKey={jobId}><JobDetailsContent /></ErrorBoundary>;
}
