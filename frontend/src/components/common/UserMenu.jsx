import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronDown, LogOut } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import Avatar from '@/components/ui/Avatar';
import useClickOutside from '@/hooks/useClickOutside';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { ROLE_MENU } from '@/constants/navigation';
import { labelFor } from '@/utils/format';
import { USER_ROLE_OPTIONS } from '@/constants';

export default function UserMenu() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close);

  const handleLogout = async () => {
    try { await authService.logout(); } catch { /* the local session is cleared either way */ }
    logout();
    queryClient.clear();
    navigate('/');
  };

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" onClick={() => setOpen((value) => !value)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-full p-1 pr-2 hover:bg-slate-100">
        <Avatar src={user?.profileImage} name={user?.name} size="sm" />
        <ChevronDown className="h-4 w-4 text-slate-500" aria-hidden="true" />
        <span className="sr-only">Open account menu</span>
      </button>
      {open && (
        <div role="menu" className="absolute left-1/2 z-40 mt-2 w-60 -translate-x-1/2 overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-lg sm:right-0 sm:left-auto sm:translate-x-0 max-w-[calc(100vw-1rem)]">
          <div className="border-b border-slate-100 px-3 py-2">
            <p className="truncate text-sm font-semibold">{user?.name}</p>
            <p className="truncate text-xs text-slate-500">{user?.email}</p>
            <p className="mt-0.5 text-xs text-brand-700">{labelFor(USER_ROLE_OPTIONS, user?.role)}</p>
          </div>
          <div className="py-1">
            {(ROLE_MENU[user?.role] || []).map((item) => (
              <Link key={item.to} to={item.to} role="menuitem" onClick={close} className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">{item.label}</Link>
            ))}
          </div>
          <button type="button" role="menuitem" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}
