import Skeleton from './Skeleton';
import { cn } from '@/utils/cn';

const tones = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  purple: 'bg-violet-50 text-violet-600',
  red: 'bg-red-50 text-red-600',
};

export default function StatCard({ label, value, icon: Icon, tone = 'blue', loading = false }) {
  if (loading) return <Skeleton className="h-24" />;
  return (
    <div className="card flex items-center gap-4 p-4">
      {Icon && (
        <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', tones[tone])}>
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">{label}</p>
        <p className="font-display text-2xl font-bold text-slate-900">{value ?? 0}</p>
      </div>
    </div>
  );
}
