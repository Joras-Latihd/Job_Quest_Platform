import { CheckCircle2, ShieldAlert } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { APPLICATION_METHODS } from '@/constants';
import { labelFor } from '@/utils/format';

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

function HowToApply({ job }) {
  const method = job.applicationMethod || 'PLATFORM';
  const questions = job.screeningQuestions?.length || 0;
  return (
    <Section title="How to apply">
      <p className="text-sm text-slate-700">{labelFor(APPLICATION_METHODS, method)}.</p>
      {method === 'PLATFORM' && (
        <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
          <li>Have a resume ready (PDF, DOC or DOCX, up to 5 MB). You can upload one while applying.</li>
          <li>A short cover letter is optional but recommended.</li>
          {questions > 0 && <li>The employer will ask you {questions} screening question{questions === 1 ? '' : 's'}.</li>}
          <li>You can track the status of your application from your dashboard.</li>
        </ul>
      )}
      {method === 'EMAIL' && <p className="mt-2 text-sm text-slate-600">Send your resume and a short note to <strong>{job.applicationUrl}</strong>.</p>}
      {method === 'EXTERNAL' && <p className="mt-2 text-sm text-slate-600">You will be taken to the company website to complete your application.</p>}
    </Section>
  );
}

// onReport is optional (the admin view does not need it).
export default function JobContent({ job, onReport }) {
  const lists = [['Responsibilities', job.responsibilities], ['Requirements', job.requirements], ['Qualifications', job.qualifications], ['Benefits', job.benefits]];
  return (
    <div className="space-y-5">
      <Section title="Job description"><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p></Section>
      {lists.map(([title, items]) => items?.length > 0 && <Section key={title} title={title}><BulletList items={items} /></Section>)}
      {job.skills?.length > 0 && <Section title="Skills"><div className="flex flex-wrap gap-2">{job.skills.map((skill) => <Badge key={skill} tone="blue">{skill}</Badge>)}</div></Section>}
      <HowToApply job={job} />
      <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
        <p>Stay safe: a real employer never asks you to pay to apply or to share bank or card details. {onReport && <button type="button" onClick={onReport} className="font-medium text-brand-600 hover:underline">Report this job</button>}</p>
      </div>
    </div>
  );
}
