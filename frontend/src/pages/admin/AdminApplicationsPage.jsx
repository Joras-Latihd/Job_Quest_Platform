import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { APPLICATION_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

export default function AdminApplicationsPage() {
  useDocumentTitle('Applications');
  const table = useTableQuery(['admin', 'applications'], adminService.applications, { filters: { status: '' }, sort: { key: 'appliedAt', dir: 'desc' } });
  const columns = [
    { key: 'candidate', header: 'Candidate', render: (a) => <div className="text-left"><p className="font-medium">{a.candidate?.name}</p><p className="text-xs text-slate-500">{a.candidate?.email}</p></div> },
    { key: 'job', header: 'Job', render: (a) => <div className="text-left"><p>{a.job?.title}</p><p className="text-xs text-slate-500">{a.job?.company?.name}</p></div> },
    { key: 'status', header: 'Status', render: (a) => <StatusBadge status={a.status} options={APPLICATION_STATUSES} /> },
    { key: 'appliedAt', header: 'Applied', sortable: true, render: (a) => formatDate(a.appliedAt) },
  ];
  return (
    <div>
      <PageHeader title="Applications" description="Read-only overview of all applications on the platform." />
      <TableToolbar table={table} placeholder="Search by candidate or job" filters={[{ key: 'status', label: 'All statuses', options: APPLICATION_STATUSES }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No applications found" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
