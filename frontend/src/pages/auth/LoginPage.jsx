import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { loginSchema } from '@/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';
import { ROLE_HOME } from '@/constants/navigation';
import { toast } from '@/utils/toast';

export default function LoginPage() {
  useDocumentTitle('Log in');
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();
  const location = useLocation();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '', remember: true } });

  const onSubmit = async ({ email, password, remember }) => {
    setServerError('');
    try {
      const response = await authService.login({ email, password });
      const { token, user } = response.data;
      setSession(token, user, remember);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      // Send people back to the page they wanted, but only if their role may open it.
      const from = location.state?.from?.pathname;
      navigate(from && !from.startsWith('/admin') && !from.startsWith('/employer') ? from : ROLE_HOME[user.role], { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Log in</h1>
      <p className="mt-1 text-slate-500">Welcome back. Pick up where you left off.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
        {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />
        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required error={errors.password?.message} className="pr-10" {...register('password')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-9 text-slate-500 hover:text-slate-800">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <Checkbox label="Keep me signed in" {...register('remember')} />
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">New to Job Quest? <Link to="/register" className="font-medium text-brand-600 hover:underline">Create an account</Link></p>
    </div>
  );
}
