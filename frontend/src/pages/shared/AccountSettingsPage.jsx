import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { changePasswordSchema } from '@/schemas/authSchemas';

export default function AccountSettingsPage() {
  useDocumentTitle('Account settings');
  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });
  const mutation = useActionMutation(({ currentPassword, newPassword }) => authService.changePassword({ currentPassword, newPassword }), {
    success: 'Password changed.',
    onSuccess: () => reset(),
  });

  return (
    <div className="max-w-xl">
      <PageHeader title="Settings" description="Manage your sign-in details." />
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="card space-y-4 p-6" noValidate>
        <h2 className="font-sans text-base font-semibold">Change password</h2>
        <Input label="Current password" type="password" autoComplete="current-password" required error={errors.currentPassword?.message} {...register('currentPassword')} />
        <Input label="New password" type="password" autoComplete="new-password" required hint="At least 8 characters with a letter and a number." error={errors.newPassword?.message} {...register('newPassword')} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" loading={mutation.isPending}>Update password</Button>
      </form>
    </div>
  );
}
