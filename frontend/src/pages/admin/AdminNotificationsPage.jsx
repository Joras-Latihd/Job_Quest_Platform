import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { broadcastSchema } from '@/schemas/miscSchemas';
import { formatDate } from '@/utils/format';

const AUDIENCES = [{ value: 'ALL', label: 'Everyone' }, { value: 'JOB_SEEKER', label: 'Job seekers' }, { value: 'EMPLOYER', label: 'Employers' }];

export default function AdminNotificationsPage() {
  useDocumentTitle('System notifications');
  const table = useTableQuery(['admin', 'broadcasts'], adminService.broadcasts);
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(broadcastSchema), defaultValues: { title: '', message: '', audience: 'ALL' } });
  const send = useActionMutation(adminService.broadcast, { success: (res) => res.message || 'Notification sent.', invalidate: [['admin', 'broadcasts']], onSuccess: () => reset() });

  const columns = [
    { key: 'title', header: 'Title', render: (n) => <div className="text-left"><p className="font-medium">{n.title}</p><p className="text-sm text-slate-600">{n.message}</p></div> },
    { key: 'audience', header: 'Audience', render: (n) => AUDIENCES.find((item) => item.value === n.audience)?.label || n.audience },
    { key: 'recipients', header: 'Recipients', render: (n) => n.recipients ?? '-' },
    { key: 'createdAt', header: 'Sent', sortable: true, render: (n) => formatDate(n.createdAt, true) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="System notifications" description="Send an important announcement to users' notification bell." />
      <form onSubmit={handleSubmit((values) => send.mutate(values))} className="card max-w-2xl space-y-4 p-5" noValidate>
        <Input label="Title" required error={errors.title?.message} {...register('title')} />
        <Textarea label="Message" required rows={3} error={errors.message?.message} {...register('message')} />
        <Select label="Send to" options={AUDIENCES} {...register('audience')} />
        <Button type="submit" loading={send.isPending}>Send notification</Button>
      </form>
      <div>
        <h2 className="mb-3 font-sans text-base font-semibold">Sent announcements</h2>
        <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="Nothing sent yet" />
        <Pagination pagination={table.pagination} onPageChange={table.setPage} />
      </div>
    </div>
  );
}
