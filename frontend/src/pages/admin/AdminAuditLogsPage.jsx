import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { formatDate } from '@/utils/format';

export default function AdminAuditLogsPage() {
  useDocumentTitle('Audit logs');
  const table = useTableQuery(['admin', 'audit-logs'], adminService.auditLogs, { limit: 15 });
  const columns = [
    { key: 'createdAt', header: 'When', sortable: true, render: (log) => formatDate(log.createdAt, true) },
    { key: 'actor', header: 'Admin', render: (log) => log.actor?.name || '-' },
    { key: 'action', header: 'Action', render: (log) => <Badge tone="blue">{log.action}</Badge> },
    { key: 'target', header: 'Target', render: (log) => <span className="text-left">{log.targetType} {log.targetLabel || log.targetId}</span> },
    { key: 'details', header: 'Details', render: (log) => <span className="text-left text-slate-600">{log.details || '-'}</span> },
  ];
  return (
    <div>
      <PageHeader title="Audit logs" description="A record of administrative actions on the platform." />
      <TableToolbar table={table} placeholder="Search actions" />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No activity recorded yet" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
