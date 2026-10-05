import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { resetPasswordSchema } from '@/schemas/authSchemas';

export default function ResetPasswordPage() {
  useDocumentTitle('Reset password');
  const { token } = useParams();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(resetPasswordSchema), defaultValues: { password: '', confirmPassword: '' } });
  const mutation = useActionMutation(({ password }) => authService.resetPassword({ token, password }), {
    success: 'Password updated. You can log in now.',
    onSuccess: () => navigate('/login', { replace: true }),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold">Choose a new password</h1>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 space-y-4" noValidate>
        <Input label="New password" type="password" autoComplete="new-password" required hint="At least 8 characters with a letter and a number." error={errors.password?.message} {...register('password')} />
        <Input label="Confirm new password" type="password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Update password</Button>
      </form>
      <p className="mt-6 text-center text-sm"><Link to="/forgot-password" className="font-medium text-brand-600 hover:underline">Link expired? Request a new one</Link></p>
    </div>
  );
}
