import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Bookmark } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { savedJobService } from '@/services/savedJobService';
import { JOB_TYPES } from '@/constants';
import { formatDate, formatLocation, formatSalary, labelFor } from '@/utils/format';

export default function SavedJobsPage() {
  useDocumentTitle('Saved jobs');
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['saved-jobs', page], queryFn: () => savedJobService.list({ page, limit: 10 }), placeholderData: keepPreviousData });
  const remove = useActionMutation(savedJobService.remove, { success: 'Removed from saved jobs.', invalidate: [['saved-jobs'], ['seeker-dashboard']] });
  const items = query.data?.data || [];

  return (
    <div className="max-w-4xl">
      <PageHeader title="Saved jobs" description="Jobs you bookmarked to come back to." />
      {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? <div className="space-y-3"><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : items.length === 0 ? (
        <EmptyState icon={Bookmark} title="You haven't saved any jobs yet" description="Start exploring opportunities." action={<Button as={Link} to="/find-jobs">Find jobs</Button>} />
      ) : (
        <ul className="space-y-3">
          {items.map(({ _id, job, savedAt }) => (
            <li key={_id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Avatar src={job.company?.logo} name={job.company?.name} square size="lg" />
              <div className="min-w-0 flex-1">
                <Link to={`/jobs/${job._id}`} className="block truncate font-semibold hover:text-brand-600">{job.title}</Link>
                <p className="truncate text-sm text-slate-600">{job.company?.name} &middot; {formatLocation(job.location)}</p>
                <p className="text-sm text-slate-600">{formatSalary(job.salary)} &middot; {labelFor(JOB_TYPES, job.jobType)}</p>
                <p className="text-xs text-slate-500">Deadline {formatDate(job.deadline)} &middot; saved {formatDate(savedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button as={Link} to={`/jobs/${job._id}`} size="sm">Open &amp; apply</Button>
                <Button variant="outline" size="sm" onClick={() => remove.mutate(job._id)} loading={remove.isPending && remove.variables === job._id}>Remove</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Pagination pagination={query.data?.pagination} onPageChange={setPage} />
    </div>
  );
}
