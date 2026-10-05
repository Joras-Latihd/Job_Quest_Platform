import { useAuthStore } from '@/store/authStore';

export default function useAuth() {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  return {
    user,
    isLoggedIn: Boolean(token && user),
    isSeeker: user?.role === 'JOB_SEEKER',
    isEmployer: user?.role === 'EMPLOYER',
    isAdmin: user?.role === 'ADMIN',
  };
}
