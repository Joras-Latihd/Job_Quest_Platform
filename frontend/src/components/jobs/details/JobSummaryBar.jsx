import { Banknote, Briefcase, CalendarClock, Clock, GraduationCap, MapPin, Users, Building } from 'lucide-react';
import { EDUCATION_LEVELS, JOB_TYPES, WORKPLACE_TYPES } from '@/constants';
import { deadlineLabel, formatDate, formatExperience, formatLocation, formatSalary, labelFor } from '@/utils/format';

// Quick-facts grid, like the "Job summary" box on most real job portals.
export default function JobSummaryBar({ job }) {
  const facts = [
    [Banknote, 'Salary', formatSalary(job.salary)],
    [Clock, 'Experience', formatExperience(job.experience)],
    [GraduationCap, 'Education', labelFor(EDUCATION_LEVELS, job.education)],
    [Briefcase, 'Job type', labelFor(JOB_TYPES, job.jobType)],
    [Building, 'Workplace', labelFor(WORKPLACE_TYPES, job.workplaceType)],
    [MapPin, 'Location', formatLocation(job.location)],
    [Users, 'Vacancies', job.vacancyCount ?? 1],
    [CalendarClock, 'Apply before', `${formatDate(job.deadline)} (${deadlineLabel(job.deadline)})`],
  ];
  return (
    <section className="card p-5 sm:p-6" aria-labelledby="job-summary-title">
      <h2 id="job-summary-title" className="mb-4 font-sans text-base font-semibold">Job summary</h2>
      <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {facts.map(([Icon, label, value]) => (
          <div key={label} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon className="h-4 w-4" aria-hidden="true" /></span>
            <div className="min-w-0"><dt className="text-xs text-slate-500">{label}</dt><dd className="text-sm font-medium text-slate-900">{value}</dd></div>
          </div>
        ))}
      </dl>
    </section>
  );
}
