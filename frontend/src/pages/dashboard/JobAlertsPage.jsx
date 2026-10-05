import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { BellRing } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Badge from '@/components/ui/Badge';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useCategories, useLocations } from '@/hooks/useMeta';
import { alertService } from '@/services/engagementService';
import { alertSchema } from '@/schemas/miscSchemas';
import { ALERT_FREQUENCIES, JOB_TYPES } from '@/constants';
import { labelFor } from '@/utils/format';

const EMPTY = { name: '', keywords: '', location: '', category: '', jobType: '', minSalary: '', frequency: 'DAILY' };

function AlertFormModal({ alert, onClose }) {
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(alertSchema), defaultValues: alert ? { ...EMPTY, ...alert, category: alert.category?._id || alert.category || '', minSalary: alert.minSalary ?? '' } : EMPTY });
  const save = useActionMutation((values) => {
    const payload = { ...values, minSalary: values.minSalary ? Number(values.minSalary) : undefined, category: values.category || undefined };
    return alert._id ? alertService.update(alert._id, payload) : alertService.create(payload);
  }, { success: 'Job alert saved.', invalidate: [['job-alerts'], ['seeker-dashboard']], onSuccess: onClose });

  return (
    <Modal open onClose={onClose} title={alert._id ? 'Edit job alert' : 'New job alert'} footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="alert-form" loading={save.isPending}>Save alert</Button></>}>
      <form id="alert-form" onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-4" noValidate>
        <Input label="Alert name" required placeholder="React Developer Jobs" error={errors.name?.message} {...register('name')} />
        <Input label="Keywords" required placeholder="React Developer" error={errors.keywords?.message} {...register('keywords')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Location" placeholder="Anywhere" options={locations.map((item) => ({ value: item.city, label: item.city }))} {...register('location')} />
          <Select label="Category" placeholder="Any category" options={categories.map((item) => ({ value: item._id, label: item.name }))} {...register('category')} />
          <Select label="Job type" placeholder="Any type" options={JOB_TYPES} {...register('jobType')} />
          <Input label="Minimum salary (NPR)" type="number" min="0" error={errors.minSalary?.message} {...register('minSalary')} />
        </div>
        <Select label="Frequency" options={ALERT_FREQUENCIES} {...register('frequency')} />
      </form>
    </Modal>
  );
}

export default function JobAlertsPage() {
  useDocumentTitle('Job alerts');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const query = useQuery({ queryKey: ['job-alerts'], queryFn: alertService.list, select: (res) => res.data });
  const toggle = useActionMutation(({ _id, isActive }) => alertService.update(_id, { isActive: !isActive }), { invalidate: [['job-alerts']] });
  const remove = useActionMutation(alertService.remove, { success: 'Alert deleted.', invalidate: [['job-alerts'], ['seeker-dashboard']], onSuccess: () => setDeleting(null) });

  return (
    <div className="max-w-4xl">
      <PageHeader title="Job alerts" description="Get notified in Job Quest when new jobs match your search." actions={<Button onClick={() => setEditing(EMPTY)}>New alert</Button>} />
      {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? <Skeleton className="h-32" /> : query.data.length === 0 ? (
        <EmptyState icon={BellRing} title="No job alerts yet" description="Create an alert and we will notify you when matching jobs are posted." action={<Button onClick={() => setEditing(EMPTY)}>Create your first alert</Button>} />
      ) : (
        <ul className="space-y-3">
          {query.data.map((alert) => (
            <li key={alert._id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="font-semibold">{alert.name} {!alert.isActive && <Badge>Paused</Badge>}</p>
                <p className="text-sm text-slate-600">{[alert.keywords, alert.location, alert.jobType && labelFor(JOB_TYPES, alert.jobType), alert.minSalary && `from NPR ${alert.minSalary}`].filter(Boolean).join(' - ')}</p>
                <p className="text-xs text-slate-500">{labelFor(ALERT_FREQUENCIES, alert.frequency)}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toggle.mutate(alert)}>{alert.isActive ? 'Pause' : 'Resume'}</Button>
                <Button variant="outline" size="sm" onClick={() => setEditing(alert)}>Edit</Button>
                <Button variant="ghost" size="sm" className="text-red-600" onClick={() => setDeleting(alert)}>Delete</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      {editing && <AlertFormModal alert={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} title="Delete this alert?" message={`You will stop receiving notifications for "${deleting?.name}".`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate(deleting._id)} onCancel={() => setDeleting(null)} />
    </div>
  );
}
