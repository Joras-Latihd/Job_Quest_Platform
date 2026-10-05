import { useQuery } from '@tanstack/react-query';
import { Briefcase, Building2, ClipboardList, Clock, UserCheck, UserPlus, Users, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import { BreakdownChart, TrendChart } from '@/components/admin/Charts';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';

export default function AdminDashboardPage() {
  useDocumentTitle('Admin dashboard');
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['admin', 'dashboard'], queryFn: adminService.dashboard, select: (res) => res.data });
  if (isError) return <ErrorState onRetry={refetch} />;
  const stats = data?.stats || {};
  const cards = [
    ['Total users', stats.totalUsers, Users, 'blue'], ['Job seekers', stats.jobSeekers, UserCheck, 'green'], ['Employers', stats.employers, ShieldCheck, 'purple'], ['Companies', stats.companies, Building2, 'blue'],
    ['Active jobs', stats.activeJobs, Briefcase, 'green'], ['Pending jobs', stats.pendingJobs, Clock, 'amber'], ['Applications', stats.applications, ClipboardList, 'purple'], ['New users (7 days)', stats.newUsers, UserPlus, 'amber'],
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Platform activity at a glance." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(([label, value, icon, tone]) => <StatCard key={label} label={label} value={value} icon={icon} tone={tone} loading={isLoading} />)}
      </div>
      {isLoading ? <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-80" /><Skeleton className="h-80" /></div> : (
        <div className="grid gap-6 lg:grid-cols-2">
          <TrendChart title="Jobs posted" data={data.jobsOverTime} />
          <TrendChart title="Applications" data={data.applicationsOverTime} />
          <TrendChart title="User registrations" data={data.registrations} />
          <BreakdownChart title="Jobs by category" data={data.jobsByCategory} />
          <BreakdownChart title="Jobs by location" data={data.jobsByLocation} />
        </div>
      )}
    </div>
  );
}
