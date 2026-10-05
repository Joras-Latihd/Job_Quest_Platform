import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { forgotPasswordSchema } from '@/schemas/authSchemas';

export default function ForgotPasswordPage() {
  useDocumentTitle('Forgot password');
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: '' } });
  const mutation = useActionMutation(authService.forgotPassword, { onSuccess: () => setSent(true) });

  return (
    <div>
      <h1 className="text-3xl font-bold">Forgot your password?</h1>
      {sent ? (
        <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800" role="status">
          If an account exists for that email, a reset link has been sent. In development builds without email, the link is printed in the backend console.
        </div>
      ) : (
        <>
          <p className="mt-1 text-slate-500">Enter your email and we will send a link to reset it.</p>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="mt-6 space-y-4" noValidate>
            <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
            <Button type="submit" size="lg" className="w-full" loading={mutation.isPending}>Send reset link</Button>
          </form>
        </>
      )}
      <p className="mt-6 text-center text-sm"><Link to="/login" className="font-medium text-brand-600 hover:underline">Back to log in</Link></p>
    </div>
  );
}
