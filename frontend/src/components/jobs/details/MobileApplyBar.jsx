import ApplyAction from './ApplyAction';
import { formatSalary } from '@/utils/format';

// Fixed bottom bar on phones so "Apply" is always one tap away.
export default function MobileApplyBar({ job, onApply }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-slate-200 bg-white/95 p-3 shadow-[0_-4px_12px_rgba(15,23,42,0.06)] backdrop-blur lg:hidden">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{job.title}</p>
        <p className="truncate text-xs text-slate-500">{formatSalary(job.salary)}</p>
      </div>
      <ApplyAction job={job} onApply={onApply} size="md" />
    </div>
  );
}
