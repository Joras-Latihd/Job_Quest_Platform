import { SearchX } from 'lucide-react';
import JobCard from './JobCard';
import JobCardSkeleton from './JobCardSkeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

// Shows loading, error, empty and result states for any job query.
export default function JobList({ query, skeletonCount = 4, emptyTitle = 'No jobs found', emptyDescription = 'Try changing your search filters.', emptyAction }) {
  if (query.isLoading) return <JobCardSkeleton count={skeletonCount} />;
  if (query.isError) return <ErrorState message={query.error?.message} onRetry={query.refetch} />;
  const jobs = query.data?.data || [];
  if (!jobs.length) return <EmptyState icon={SearchX} title={emptyTitle} description={emptyDescription} action={emptyAction} />;
  return <div className="space-y-4">{jobs.map((job) => <JobCard key={job._id} job={job} />)}</div>;
}
