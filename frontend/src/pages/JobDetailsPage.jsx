import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import JobHeader from '@/components/jobs/details/JobHeader';
import JobContent from '@/components/jobs/details/JobContent';
import CompanySidebar from '@/components/jobs/details/CompanySidebar';
import RelatedJobs from '@/components/jobs/details/RelatedJobs';
import ApplyModal from '@/components/jobs/details/ApplyModal';
import ReportJobModal from '@/components/common/ReportJobModal';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { jobService } from '@/services/jobService';

export default function JobDetailsPage() {
  const { jobId } = useParams();
  const [applyOpen, setApplyOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const { data: job, isLoading, isError, error, refetch } = useQuery({ queryKey: ['job', jobId], queryFn: () => jobService.getById(jobId), select: (res) => res.data });
  useDocumentTitle(job ? `${job.title} at ${job.company?.name}` : 'Job details');

  if (isLoading) {
    return <div className="container-page space-y-5 py-8"><Skeleton className="h-56" /><Skeleton className="h-72" /></div>;
  }
  if (isError) {
    return <div className="container-page py-12"><ErrorState message={error.status === 404 ? 'This job could not be found. It may have been removed or closed.' : error.message} onRetry={error.status === 404 ? undefined : refetch} /></div>;
  }

  return (
    <div className="container-page py-8">
      <JobHeader job={job} onApply={() => setApplyOpen(true)} onReport={() => setReportOpen(true)} />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem]">
        <JobContent job={job} />
        <div className="space-y-5">
          <CompanySidebar company={job.company} />
          <RelatedJobs jobId={job._id} />
        </div>
      </div>
      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} job={job} />
      <ReportJobModal open={reportOpen} onClose={() => setReportOpen(false)} job={job} />
    </div>
  );
}
