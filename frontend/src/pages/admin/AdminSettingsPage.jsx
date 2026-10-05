import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';

export default function AdminSettingsPage() {
  useDocumentTitle('Platform settings');
  const query = useQuery({ queryKey: ['admin', 'settings'], queryFn: adminService.settings, select: (res) => res.data });
  const { register, handleSubmit, reset, formState: { isDirty } } = useForm({ defaultValues: { requireJobApproval: true, requireEmployerVerification: true, allowRegistrations: true, popularSearches: '' } });
  useEffect(() => { if (query.data) reset({ ...query.data, popularSearches: (query.data.popularSearches || []).join(', ') }); }, [query.data, reset]);
  const save = useActionMutation((values) => adminService.updateSettings({ ...values, popularSearches: values.popularSearches.split(',').map((item) => item.trim()).filter(Boolean) }), { success: 'Settings saved.', invalidate: [['admin', 'settings'], ['popular-searches']] });

  if (query.isError) return <ErrorState onRetry={query.refetch} />;
  if (query.isLoading) return <Skeleton className="h-72 max-w-2xl" />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Settings" description="Rules that apply to the whole platform." />
      <form onSubmit={handleSubmit((values) => save.mutate(values))} className="card space-y-5 p-6">
        <Checkbox label="New jobs need admin approval before they are public" {...register('requireJobApproval')} />
        <Checkbox label="Employers must be verified before their jobs can be published" {...register('requireEmployerVerification')} />
        <Checkbox label="Allow new registrations" {...register('allowRegistrations')} />
        <Input label="Popular searches on the homepage" hint="Separate with commas." {...register('popularSearches')} />
        <Button type="submit" loading={save.isPending} disabled={!isDirty}>Save settings</Button>
      </form>
    </div>
  );
}
