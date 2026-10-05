import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { formatDate } from '@/utils/format';

export default function AdminMessagesPage() {
  useDocumentTitle('Contact messages');
  const table = useTableQuery(['admin', 'messages'], adminService.messages, { filters: { isRead: '' } });
  const mark = useActionMutation((message) => adminService.updateMessage(message._id, { isRead: !message.isRead }), { invalidate: [['admin', 'messages']] });

  const columns = [
    { key: 'from', header: 'From', render: (m) => <div className="text-left"><p className="font-medium">{m.name}</p><a href={`mailto:${m.email}`} className="text-xs text-brand-600 hover:underline">{m.email}</a></div> },
    { key: 'subject', header: 'Message', render: (m) => <div className="max-w-md text-left"><p className="font-medium">{m.subject}</p><p className="whitespace-pre-line text-sm text-slate-600">{m.message}</p></div> },
    { key: 'createdAt', header: 'Received', sortable: true, render: (m) => formatDate(m.createdAt, true) },
    { key: 'isRead', header: 'Status', render: (m) => <Badge tone={m.isRead ? 'gray' : 'blue'}>{m.isRead ? 'Read' : 'New'}</Badge> },
    { key: 'actions', header: 'Actions', render: (m) => <Button variant="ghost" size="sm" onClick={() => mark.mutate(m)}>{m.isRead ? 'Mark unread' : 'Mark read'}</Button> },
  ];

  return (
    <div>
      <PageHeader title="Contact messages" description="Messages sent through the public contact form." />
      <TableToolbar table={table} placeholder="Search messages" filters={[{ key: 'isRead', label: 'All messages', options: [{ value: 'false', label: 'Unread' }, { value: 'true', label: 'Read' }] }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No messages" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
