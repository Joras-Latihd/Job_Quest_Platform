import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { registerSchema } from '@/schemas/authSchemas';
import { useAuthStore } from '@/store/authStore';
import { COMPANY_SIZES, INDUSTRIES } from '@/constants';
import { ROLE_HOME } from '@/constants/navigation';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/cn';

const ROLE_TABS = [{ value: 'JOB_SEEKER', label: "I'm looking for a job" }, { value: 'EMPLOYER', label: "I'm hiring" }];

export default function RegisterPage() {
  useDocumentTitle('Create an account');
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const setSession = useAuthStore((state) => state.setSession);
  const navigate = useNavigate();

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: searchParams.get('role') === 'EMPLOYER' ? 'EMPLOYER' : 'JOB_SEEKER', name: '', email: '', password: '', confirmPassword: '', companyName: '', industry: '', companySize: '', phone: '' },
  });
  const role = watch('role');

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const { confirmPassword, ...payload } = values;
      const response = await authService.register(payload);
      const { token, user } = response.data;
      setSession(token, user, true);
      toast.success(role === 'EMPLOYER' ? 'Account created. Your company will be reviewed by our team.' : 'Account created. Welcome to Job Quest!');
      navigate(ROLE_HOME[user.role], { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold">Create your account</h1>
      <div role="tablist" aria-label="Account type" className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
        {ROLE_TABS.map((tab) => (
          <button key={tab.value} type="button" role="tab" aria-selected={role === tab.value} onClick={() => setValue('role', tab.value)} className={cn('rounded-lg px-3 py-2 text-sm font-medium transition', role === tab.value ? 'bg-white text-brand-700 shadow-sm' : 'text-slate-600')}>{tab.label}</button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
        <Input label="Full name" autoComplete="name" required error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" required error={errors.email?.message} {...register('email')} />

        {role === 'EMPLOYER' && (
          <fieldset className="space-y-4 rounded-xl border border-slate-200 p-4">
            <legend className="px-1 text-sm font-semibold">Company details</legend>
            <Input label="Company name" required error={errors.companyName?.message} {...register('companyName')} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Select label="Industry" required placeholder="Select" options={INDUSTRIES} error={errors.industry?.message} {...register('industry')} />
              <Select label="Company size" required placeholder="Select" options={COMPANY_SIZES} error={errors.companySize?.message} {...register('companySize')} />
            </div>
            <Input label="Company phone" type="tel" error={errors.phone?.message} {...register('phone')} />
            <p className="text-xs text-slate-500">You can add your logo, description and website later from the company profile. New employers are verified by our team before jobs go public.</p>
          </fieldset>
        )}

        <div className="relative">
          <Input label="Password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required hint="At least 8 characters with a letter and a number." error={errors.password?.message} className="pr-10" {...register('password')} />
          <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-9 text-slate-500 hover:text-slate-800">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
        </div>
        <Input label="Confirm password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>Create account</Button>
        <p className="text-center text-xs text-slate-500">By registering you agree to our <Link to="/terms" className="underline">Terms</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>.</p>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">Already have an account? <Link to="/login" className="font-medium text-brand-600 hover:underline">Log in</Link></p>
    </div>
  );
}
