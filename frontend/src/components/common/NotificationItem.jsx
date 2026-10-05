import { Bell } from 'lucide-react';
import { timeAgo } from '@/utils/format';
import { cn } from '@/utils/cn';

export default function NotificationItem({ notification, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={cn('flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition hover:bg-slate-50', !notification.isRead && 'bg-brand-50/60')}
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700"><Bell className="h-4 w-4" aria-hidden="true" /></span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-slate-900">{notification.title}</span>
          {!notification.isRead && <span className="rounded-full bg-brand-600 px-1.5 text-[10px] font-semibold text-white">New</span>}
        </span>
        <span className="line-clamp-2 text-sm text-slate-600">{notification.message}</span>
        <span className="text-xs text-slate-400">{timeAgo(notification.createdAt)}</span>
      </span>
    </button>
  );
}
