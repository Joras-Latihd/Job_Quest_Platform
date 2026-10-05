import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { PageLoader } from '@/components/ui/Spinner';
import ForbiddenPage from '@/pages/ForbiddenPage';

/*
 * Frontend guard only - it improves UX. The API enforces the same rules with its own middleware.
 * roles: array of allowed roles. Omit to allow any logged-in user.
 */
export default function ProtectedRoute({ roles }) {
  const { token, user, isBootstrapped } = useAuthStore();
  const location = useLocation();

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isBootstrapped || !user) return <PageLoader />;
  if (roles && !roles.includes(user.role)) return <ForbiddenPage />;
  return <Outlet />;
}
