import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';
import { ROLE_HOME } from '@/constants/navigation';

export default function ForbiddenPage() {
  const { user } = useAuth();
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <ShieldAlert className="h-12 w-12 text-red-500" aria-hidden="true" />
      <h1 className="mt-4 text-2xl font-bold">Access denied</h1>
      <p className="mt-2 max-w-md text-slate-600">Your account does not have permission to open this page.</p>
      <Button as={Link} to={ROLE_HOME[user?.role] || '/'} className="mt-6">Back to my dashboard</Button>
    </div>
  );
}
