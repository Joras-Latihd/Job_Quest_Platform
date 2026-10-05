import { Check, X } from 'lucide-react';
import { APPLICATION_FLOW, APPLICATION_STATUSES } from '@/constants';
import { formatDate, getStatus } from '@/utils/format';
import { cn } from '@/utils/cn';

// Vertical timeline. `history` is [{ status, changedAt, note }] from the API.
export default function ApplicationStatus({ status, history = [] }) {
  const terminal = status === 'REJECTED' || status === 'WITHDRAWN';
  const currentIndex = APPLICATION_FLOW.indexOf(status);
  const dateFor = (value) => history.find((entry) => entry.status === value)?.changedAt;

  return (
    <ol className="relative space-y-5" aria-label="Application progress">
      {APPLICATION_FLOW.map((step, index) => {
        const reached = !terminal ? index <= currentIndex : history.some((entry) => entry.status === step);
        const isCurrent = !terminal && index === currentIndex;
        const { label } = getStatus(APPLICATION_STATUSES, step);
        return (
          <li key={step} className="flex gap-3" aria-current={isCurrent ? 'step' : undefined}>
            <span className={cn('mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs', reached ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white text-slate-400', isCurrent && 'ring-4 ring-brand-100')}>
              {reached ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
            </span>
            <div>
              <p className={cn('text-sm font-medium', reached ? 'text-slate-900' : 'text-slate-400')}>
                {label}{isCurrent && <span className="ml-2 text-xs font-semibold text-brand-600">Current stage</span>}
              </p>
              {dateFor(step) && <p className="text-xs text-slate-500">{formatDate(dateFor(step), true)}</p>}
            </div>
          </li>
        );
      })}
      {terminal && (
        <li className="flex gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white"><X className="h-3.5 w-3.5" aria-hidden="true" /></span>
          <div>
            <p className="text-sm font-semibold text-red-700">{getStatus(APPLICATION_STATUSES, status).label}</p>
            {dateFor(status) && <p className="text-xs text-slate-500">{formatDate(dateFor(status), true)}</p>}
          </div>
        </li>
      )}
    </ol>
  );
}
