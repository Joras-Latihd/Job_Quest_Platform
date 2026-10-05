import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import NotificationItem from './NotificationItem';
import useClickOutside from '@/hooks/useClickOutside';
import useActionMutation from '@/hooks/useActionMutation';
import { notificationService } from '@/services/notificationService';
import { useAuthStore } from '@/store/authStore';
import { ROLE_HOME } from '@/constants/navigation';

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const role = useAuthStore((state) => state.user?.role);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(containerRef, close);

  // Poll once a minute - simple and enough for this project (no websockets needed).
  const { data } = useQuery({ queryKey: ['notifications', 'preview'], queryFn: () => notificationService.list({ limit: 6 }), refetchInterval: 60000 });
  const notifications = data?.data || [];
  const unreadCount = data?.unreadCount || 0;
  const refresh = [['notifications']];

  const markRead = useActionMutation(notificationService.markRead, { invalidate: refresh });
  const markAllRead = useActionMutation(notificationService.markAllRead, { invalidate: refresh });

  const openNotification = (notification) => {
    if (!notification.isRead) markRead.mutate(notification._id);
    close();
    if (notification.link) navigate(notification.link);
  };

  const allNotificationsPath = `${role === 'EMPLOYER' ? '/employer' : role === 'ADMIN' ? '/admin' : '/dashboard'}/notifications`;

  return (
    <div className="relative" ref={containerRef}>
      <button type="button" onClick={() => { setOpen((value) => !value); queryClient.invalidateQueries({ queryKey: ['notifications'] }); }} aria-haspopup="true" aria-expanded={open} className="relative rounded-full p-2 text-slate-600 hover:bg-slate-100">
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        <span className="sr-only">Notifications{unreadCount ? `, ${unreadCount} unread` : ''}</span>
      </button>
      {open && (
        <div className="absolute -right-12 z-40 mt-2 w-[22rem] max-w-[92vw] rounded-xl border border-slate-200 bg-white shadow-lg sm:right-0">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && <button type="button" onClick={() => markAllRead.mutate()} className="text-xs font-medium text-brand-600 hover:underline">Mark all as read</button>}
          </div>
          <div className="max-h-96 overflow-y-auto p-1">
            {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">You are all caught up.</p> : notifications.map((item) => <NotificationItem key={item._id} notification={item} onClick={openNotification} />)}
          </div>
          <Link to={allNotificationsPath || ROLE_HOME[role]} onClick={close} className="block border-t border-slate-100 px-4 py-2.5 text-center text-sm font-medium text-brand-600 hover:bg-slate-50">View all notifications</Link>
        </div>
      )}
    </div>
  );
}
