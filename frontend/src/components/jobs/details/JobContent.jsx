import { CheckCircle2 } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { APPLICATION_METHODS, EDUCATION_LEVELS } from '@/constants';
import { formatDate, formatExperience, formatLocation, formatSalary, labelFor } from '@/utils/format';

function Section({ title, children }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

const BulletList = ({ items }) => (
  <ul className="space-y-2 text-sm text-slate-700">
    {items.map((item, index) => <li key={index} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" aria-hidden="true" />{item}</li>)}
  </ul>
);

export default function JobContent({ job }) {
  const lists = [
    ['Responsibilities', job.responsibilities], ['Requirements', job.requirements],
    ['Qualifications', job.qualifications], ['Benefits', job.benefits],
  ];
  return (
    <div className="space-y-5">
      <Section title="Job description"><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p></Section>
      {lists.map(([title, items]) => items?.length > 0 && <Section key={title} title={title}><BulletList items={items} /></Section>)}
      {job.skills?.length > 0 && (
        <Section title="Skills">
          <div className="flex flex-wrap gap-2">{job.skills.map((skill) => <Badge key={skill} tone="blue">{skill}</Badge>)}</div>
        </Section>
      )}
      <Section title="Salary and working location">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Salary</dt><dd className="font-medium">{formatSalary(job.salary)}{job.salary?.negotiable && job.salary?.min ? ' (negotiable)' : ''}</dd></div>
          <div><dt className="text-slate-500">Working location</dt><dd className="font-medium">{formatLocation(job.location)}</dd></div>
        </dl>
      </Section>
      <Section title="Application information">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt className="text-slate-500">Vacancies</dt><dd className="font-medium">{job.vacancyCount}</dd></div>
          <div><dt className="text-slate-500">Deadline</dt><dd className="font-medium">{formatDate(job.deadline)}</dd></div>
          <div><dt className="text-slate-500">Experience</dt><dd className="font-medium">{formatExperience(job.experience)}</dd></div>
          <div><dt className="text-slate-500">Minimum education</dt><dd className="font-medium">{labelFor(EDUCATION_LEVELS, job.education)}</dd></div>
          <div><dt className="text-slate-500">How to apply</dt><dd className="font-medium">{labelFor(APPLICATION_METHODS, job.applicationMethod || 'PLATFORM')}</dd></div>
        </dl>
      </Section>
    </div>
  );
}
