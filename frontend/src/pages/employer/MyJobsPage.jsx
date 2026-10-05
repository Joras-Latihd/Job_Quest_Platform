import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { jobService } from '@/services/jobService';
import { JOB_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

export default function MyJobsPage() {
  useDocumentTitle('My jobs');
  const table = useTableQuery(['employer-jobs'], jobService.mine, { filters: { status: '' } });
  const [pending, setPending] = useState(null); // { type: 'close' | 'delete', job }
  const refresh = { invalidate: [['employer-jobs'], ['employer-dashboard']] };
  const duplicate = useActionMutation(jobService.duplicate, { success: 'Job duplicated as a draft.', ...refresh });
  const close = useActionMutation((id) => jobService.updateStatus(id, { status: 'CLOSED' }), { success: 'Job closed.', ...refresh, onSuccess: () => setPending(null) });
  const remove = useActionMutation(jobService.remove, { success: 'Job deleted.', ...refresh, onSuccess: () => setPending(null) });

  const columns = [
    { key: 'title', header: 'Job title', sortable: true, render: (job) => <Link to={`/employer/jobs/${job._id}/applicants`} className="font-medium hover:text-brand-600">{job.title}</Link> },
    { key: 'status', header: 'Status', render: (job) => <div><StatusBadge status={job.status} options={JOB_STATUSES} />{job.rejectionReason && <p className="mt-1 max-w-[14rem] text-xs text-red-600">Reason: {job.rejectionReason}</p>}</div> },
    { key: 'applicationsCount', header: 'Applications', sortable: true, render: (job) => <Link to={`/employer/jobs/${job._id}/applicants`} className="text-brand-600 hover:underline">{job.applicationsCount ?? 0}</Link> },
    { key: 'createdAt', header: 'Posted', sortable: true, render: (job) => formatDate(job.createdAt) },
    { key: 'deadline', header: 'Deadline', sortable: true, render: (job) => formatDate(job.deadline) },
    { key: 'views', header: 'Views', sortable: true, render: (job) => job.views ?? 0 },
    {
      key: 'actions', header: 'Actions',
      render: (job) => (
        <div className="flex flex-wrap justify-end gap-1">
          {job.status === 'PUBLISHED' && <Button as={Link} to={`/jobs/${job._id}`} variant="ghost" size="sm">View</Button>}
          <Button as={Link} to={`/employer/jobs/${job._id}/edit`} variant="ghost" size="sm">Edit</Button>
          <Button variant="ghost" size="sm" onClick={() => duplicate.mutate(job._id)}>Duplicate</Button>
          {['PUBLISHED', 'PENDING_APPROVAL'].includes(job.status) && <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'close', job })}>Close</Button>}
          <Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setPending({ type: 'delete', job })}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="My jobs" description="Create, edit and close your job listings." actions={<Button as={Link} to="/employer/jobs/new">Post new job</Button>} />
      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <Input aria-label="Search jobs" leftIcon={Search} placeholder="Search by job title" value={table.search} onChange={(event) => table.setSearch(event.target.value)} />
        <Select aria-label="Filter by status" placeholder="All statuses" options={JOB_STATUSES} value={table.filters.status} onChange={(event) => table.setFilter('status', event.target.value)} />
      </div>
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No jobs yet" emptyDescription="Post your first job to start receiving applications." />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />

      <ConfirmDialog open={pending?.type === 'close'} title="Close this job?" message={`"${pending?.job.title}" will stop accepting applications and disappear from search.`} confirmLabel="Close job" loading={close.isPending} onConfirm={() => close.mutate(pending.job._id)} onCancel={() => setPending(null)} />
      <ConfirmDialog open={pending?.type === 'delete'} title="Delete this job?" message={`"${pending?.job.title}" and its applications will be permanently removed. This cannot be undone.`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate(pending.job._id)} onCancel={() => setPending(null)} />
    </div>
  );
}
