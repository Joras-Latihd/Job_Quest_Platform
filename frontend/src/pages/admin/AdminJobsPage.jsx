import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ReasonDialog from '@/components/ui/ReasonDialog';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useCategories } from '@/hooks/useMeta';
import { adminService } from '@/services/adminService';
import { jobService } from '@/services/jobService';
import { JOB_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

export default function AdminJobsPage() {
  useDocumentTitle('Job moderation');
  const [searchParams] = useSearchParams();
  const { data: categories = [] } = useCategories();
  const table = useTableQuery(['admin', 'jobs'], adminService.jobs, { search: searchParams.get('search') || '', filters: { status: searchParams.get('status') || '', category: '', employer: searchParams.get('employer') || '' } });
  const [pending, setPending] = useState(null); // { type: 'approve' | 'reject' | 'close' | 'hide' | 'delete', job }
  const close = () => setPending(null);
  const refresh = { invalidate: [['admin', 'jobs'], ['admin', 'dashboard']], onSuccess: close };

  const approve = useActionMutation((job) => adminService.approveJob(job._id), { success: 'Job approved and published.', ...refresh });
  const reject = useActionMutation(({ job, reason }) => adminService.rejectJob(job._id, { reason }), { success: 'Job rejected. The employer has been notified.', ...refresh });
  const setStatus = useActionMutation(({ job, status }) => jobService.updateStatus(job._id, { status }), { success: 'Job updated.', ...refresh });
  const feature = useActionMutation((job) => jobService.feature(job._id, { isFeatured: !job.isFeatured }), { success: 'Featured status updated.', invalidate: [['admin', 'jobs'], ['admin', 'featured']] });
  const remove = useActionMutation((job) => jobService.remove(job._id), { success: 'Job deleted.', ...refresh });

  const columns = [
    { key: 'title', header: 'Job', sortable: true, render: (job) => <div className="text-left"><p className="font-medium">{job.title}</p><p className="text-xs text-slate-500">{job.company?.name}</p></div> },
    { key: 'status', header: 'Status', render: (job) => <div className="flex flex-wrap justify-end gap-1 md:justify-start"><StatusBadge status={job.status} options={JOB_STATUSES} />{job.isFeatured && <Badge tone="amber">Featured</Badge>}</div> },
    { key: 'category', header: 'Category', render: (job) => job.category?.name || '-' },
    { key: 'applicationsCount', header: 'Applications', render: (job) => job.applicationsCount ?? 0 },
    { key: 'createdAt', header: 'Posted', sortable: true, render: (job) => formatDate(job.createdAt) },
    { key: 'actions', header: 'Actions', render: (job) => (
      <div className="flex flex-wrap justify-end gap-1">
        {job.status === 'PENDING_APPROVAL' && <><Button variant="ghost" size="sm" onClick={() => setPending({ type: 'approve', job })}>Approve</Button><Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setPending({ type: 'reject', job })}>Reject</Button></>}
        {job.status === 'PUBLISHED' && <>
          <Button variant="ghost" size="sm" onClick={() => feature.mutate(job)}>{job.isFeatured ? 'Unfeature' : 'Feature'}</Button>
          <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'hide', job })}>Hide</Button>
          <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'close', job })}>Close</Button>
        </>}
        <Button as={Link} to={`/admin/jobs/${job._id}/edit`} variant="ghost" size="sm">Edit</Button>
        {job.status === 'PUBLISHED' && <Button as={Link} to={`/jobs/${job._id}`} variant="ghost" size="sm">View</Button>}
        <Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setPending({ type: 'delete', job })}>Delete</Button>
      </div>
    ) },
  ];

  const job = pending?.job;
  return (
    <div>
      <PageHeader title="Job moderation" description="Approve, reject, feature or remove job listings." />
      <TableToolbar table={table} placeholder="Search by title or company" filters={[{ key: 'status', label: 'All statuses', options: JOB_STATUSES }, { key: 'category', label: 'All categories', options: categories.map((item) => ({ value: item._id, label: item.name })) }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No jobs found" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />

      <ConfirmDialog open={pending?.type === 'approve'} title="Approve this job?" message={`"${job?.title}" will become public and appear in search.`} confirmLabel="Approve" loading={approve.isPending} onConfirm={() => approve.mutate(job)} onCancel={close} />
      <ReasonDialog open={pending?.type === 'reject'} title="Reject job" description="The employer will see this reason and can edit and resubmit." confirmLabel="Reject job" loading={reject.isPending} onConfirm={(reason) => reject.mutate({ job, reason })} onCancel={close} />
      <ConfirmDialog open={pending?.type === 'hide'} title="Hide this job?" message="The job returns to pending approval and disappears from public search until approved again." confirmLabel="Hide" loading={setStatus.isPending} onConfirm={() => setStatus.mutate({ job, status: 'PENDING_APPROVAL' })} onCancel={close} />
      <ConfirmDialog open={pending?.type === 'close'} title="Close this job?" message="The job stops accepting applications." confirmLabel="Close job" loading={setStatus.isPending} onConfirm={() => setStatus.mutate({ job, status: 'CLOSED' })} onCancel={close} />
      <ConfirmDialog open={pending?.type === 'delete'} title="Delete this job?" message={`"${job?.title}" and its applications will be permanently removed.`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate(job)} onCancel={close} />
    </div>
  );
}
