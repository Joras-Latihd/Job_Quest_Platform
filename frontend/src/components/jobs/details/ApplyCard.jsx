import { CalendarClock, Users } from 'lucide-react';
import ApplyAction, { isJobOpen } from './ApplyAction';
import SaveJobButton from '@/components/common/SaveJobButton';
import { deadlineLabel, formatDate } from '@/utils/format';

// Sticky "Apply" box in the sidebar (desktop).
export default function ApplyCard({ job, onApply }) {
  return (
    <section className="card p-5" aria-label="Apply for this job">
      <p className="flex items-center gap-2 text-sm text-slate-600"><CalendarClock className="h-4 w-4 text-slate-400" aria-hidden="true" />Apply before {formatDate(job.deadline)}</p>
      <p className={`mt-1 text-sm font-medium ${isJobOpen(job) ? 'text-brand-700' : 'text-red-600'}`}>{deadlineLabel(job.deadline)}</p>
      <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><Users className="h-4 w-4 text-slate-400" aria-hidden="true" />{job.vacancyCount ?? 1} vacanc{(job.vacancyCount ?? 1) === 1 ? 'y' : 'ies'}</p>
      <div className="mt-4 flex flex-col gap-2">
        <ApplyAction job={job} onApply={onApply} className="w-full" />
        <SaveJobButton job={job} withLabel className="w-full justify-center" />
      </div>
    </section>
  );
}
