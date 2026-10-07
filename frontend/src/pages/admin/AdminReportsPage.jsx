import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { REPORT_REASONS, REPORT_STATUSES } from '@/constants';
import { formatDate, labelFor } from '@/utils/format';

export default function AdminReportsPage() {
  useDocumentTitle('Reported jobs');
  const table = useTableQuery(['admin', 'reports'], adminService.reports, { filters: { status: 'PENDING', reason: '' } });
  const update = useActionMutation(({ id, status }) => adminService.updateReport(id, { status }), { success: 'Report updated.', invalidate: [['admin', 'reports']] });

  const columns = [
    { key: 'job', header: 'Reported job', render: (r) => <div className="text-left"><p className="font-medium">{r.job?.title || 'Deleted job'}</p><p className="text-xs text-slate-500">{r.job?.company?.name}</p></div> },
    { key: 'reason', header: 'Reason', render: (r) => <div className="text-left"><p>{labelFor(REPORT_REASONS, r.reason)}</p>{r.details && <p className="max-w-xs text-xs text-slate-500">{r.details}</p>}</div> },
    { key: 'reporter', header: 'Reported by', render: (r) => r.reporter?.name || '-' },
    { key: 'createdAt', header: 'Date', sortable: true, render: (r) => formatDate(r.createdAt) },
    { key: 'status', header: 'Status', render: (r) => <StatusBadge status={r.status} options={REPORT_STATUSES} /> },
    { key: 'actions', header: 'Actions', render: (r) => (
      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:justify-end">
        {r.job && <Button as={Link} to={`/admin/jobs?search=${encodeURIComponent(r.job.title)}`} variant="ghost" size="sm">Moderate job</Button>}
        <Select aria-label="Update report status" options={REPORT_STATUSES} value={r.status} onChange={(event) => update.mutate({ id: r._id, status: event.target.value })} className="!h-9 !py-0 text-xs sm:!h-8" wrapperClassName="w-full min-w-0 sm:w-auto" />
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Reported jobs" description="Review listings that users flagged as suspicious or incorrect." />
      <TableToolbar table={table} placeholder="Search reports" filters={[{ key: 'status', label: 'All statuses', options: REPORT_STATUSES }, { key: 'reason', label: 'All reasons', options: REPORT_REASONS }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No reports" emptyDescription="Nothing matches these filters." />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
