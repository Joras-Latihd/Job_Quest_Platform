import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { BellOff } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import Pagination from '@/components/ui/Pagination';
import NotificationItem from '@/components/common/NotificationItem';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { notificationService } from '@/services/notificationService';

export default function NotificationsPage() {
  useDocumentTitle('Notifications');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const query = useQuery({ queryKey: ['notifications', 'list', page], queryFn: () => notificationService.list({ page, limit: 15 }), placeholderData: keepPreviousData });
  const refresh = [['notifications']];
  const markRead = useActionMutation(notificationService.markRead, { invalidate: refresh });
  const markAllRead = useActionMutation(notificationService.markAllRead, { success: 'All notifications marked as read.', invalidate: refresh });
  const notifications = query.data?.data || [];

  const open = (notification) => {
    if (!notification.isRead) markRead.mutate(notification._id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Notifications" description="Updates about your applications, jobs and account." actions={query.data?.unreadCount > 0 && <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} loading={markAllRead.isPending}>Mark all as read</Button>} />
      {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? <div className="space-y-2"><Skeleton className="h-20" /><Skeleton className="h-20" /><Skeleton className="h-20" /></div> : notifications.length === 0 ? (
        <EmptyState icon={BellOff} title="No notifications yet" description="When something happens on your account it will appear here." />
      ) : (
        <div className="card divide-y divide-slate-100 p-1">{notifications.map((item) => <NotificationItem key={item._id} notification={item} onClick={open} />)}</div>
      )}
      <Pagination pagination={query.data?.pagination} onPageChange={setPage} />
    </div>
  );
}
