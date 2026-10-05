import { useEffect } from 'react';
import AppRoutes from '@/routes/AppRoutes';
import Toaster from '@/components/ui/Toaster';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

export default function App() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const setBootstrapped = useAuthStore((state) => state.setBootstrapped);

  // Session persistence: when the app opens with a saved token, refresh the user from the API.
  useEffect(() => {
    if (!token) return;
    authService.me()
      .then((response) => setUser(response.data))
      .catch(() => {}) // a 401 is handled by the axios interceptor (logs out)
      .finally(setBootstrapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <AppRoutes />
      <Toaster />
    </>
  );
}
