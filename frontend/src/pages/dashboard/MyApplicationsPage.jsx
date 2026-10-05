import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { applicationService } from '@/services/applicationService';
import { APPLICATION_STATUSES } from '@/constants';
import { formatDate, formatLocation } from '@/utils/format';

export default function MyApplicationsPage() {
  useDocumentTitle('My applications');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ['applications', 'mine', status, page], queryFn: () => applicationService.mine({ status: status || undefined, page, limit: 10 }), placeholderData: keepPreviousData });
  const applications = query.data?.data || [];

  return (
    <div className="max-w-4xl">
      <PageHeader title="My applications" description="Track every application and its current stage." actions={<Select aria-label="Filter by status" placeholder="All statuses" options={APPLICATION_STATUSES} value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} />} />
      {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? <div className="space-y-3"><Skeleton className="h-24" /><Skeleton className="h-24" /></div> : applications.length === 0 ? (
        <EmptyState icon={FileText} title="No applications yet" description="Find a job and start your application." action={<Button as={Link} to="/find-jobs">Find jobs</Button>} />
      ) : (
        <ul className="space-y-3">
          {applications.map((application) => (
            <li key={application._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
              <Avatar src={application.job?.company?.logo} name={application.job?.company?.name} square size="lg" />
              <div className="min-w-0 flex-1">
                <Link to={`/dashboard/applications/${application._id}`} className="block truncate font-semibold hover:text-brand-600">{application.job?.title}</Link>
                <p className="truncate text-sm text-slate-600">{application.job?.company?.name} &middot; {formatLocation(application.job?.location)}</p>
                <p className="text-xs text-slate-500">Applied {formatDate(application.appliedAt)}</p>
              </div>
              <div className="flex items-center gap-3"><StatusBadge status={application.status} options={APPLICATION_STATUSES} /><Button as={Link} to={`/dashboard/applications/${application._id}`} variant="outline" size="sm">Details</Button></div>
            </li>
          ))}
        </ul>
      )}
      <Pagination pagination={query.data?.pagination} onPageChange={setPage} />
    </div>
  );
}
