import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import useActionMutation from '@/hooks/useActionMutation';
import useAuth from '@/hooks/useAuth';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useCategories, useLocations } from '@/hooks/useMeta';
import { jobService } from '@/services/jobService';
import { jobSchema } from '@/schemas/jobSchemas';
import { APPLICATION_METHODS, EDUCATION_LEVELS, JOB_TYPES, SALARY_PERIODS, WORKPLACE_TYPES } from '@/constants';
import { arrayToLines, commaToArray, linesToArray, toDateInput } from '@/utils/format';

const DEFAULTS = {
  title: '', category: '', location: '', workplaceType: 'ON_SITE', jobType: 'FULL_TIME', salaryMin: '', salaryMax: '', salaryPeriod: 'MONTHLY', salaryNegotiable: false,
  experienceMin: '', experienceMax: '', education: 'BACHELOR', description: '', responsibilities: '', requirements: '', qualifications: '', skills: '', benefits: '',
  deadline: '', vacancyCount: '1', applicationMethod: 'PLATFORM', applicationUrl: '', isUrgent: false, requestFeatured: false, questions: [],
};

const idOf = (value) => value?._id || value || '';
const num = (value) => (value === '' || value == null ? undefined : Number(value));

function jobToForm(job) {
  return {
    ...DEFAULTS, title: job.title, category: idOf(job.category), location: idOf(job.location), workplaceType: job.workplaceType, jobType: job.jobType,
    salaryMin: job.salary?.min ?? '', salaryMax: job.salary?.max ?? '', salaryPeriod: job.salary?.period || 'MONTHLY', salaryNegotiable: Boolean(job.salary?.negotiable),
    experienceMin: job.experience?.min ?? '', experienceMax: job.experience?.max ?? '', education: job.education, description: job.description,
    responsibilities: arrayToLines(job.responsibilities), requirements: arrayToLines(job.requirements), qualifications: arrayToLines(job.qualifications),
    skills: (job.skills || []).join(', '), benefits: arrayToLines(job.benefits), deadline: toDateInput(job.deadline), vacancyCount: String(job.vacancyCount || 1),
    applicationMethod: job.applicationMethod || 'PLATFORM', applicationUrl: job.applicationUrl || '', isUrgent: Boolean(job.isUrgent), requestFeatured: Boolean(job.featureRequested),
    questions: (job.screeningQuestions || []).map((item) => ({ question: item.question })),
  };
}

function formToPayload(values, submitAction) {
  return {
    title: values.title, category: values.category, location: values.location, workplaceType: values.workplaceType, jobType: values.jobType,
    salary: { min: num(values.salaryMin), max: num(values.salaryMax), period: values.salaryPeriod, negotiable: values.salaryNegotiable, currency: 'NPR' },
    experience: { min: num(values.experienceMin) || 0, max: num(values.experienceMax) },
    education: values.education, description: values.description, responsibilities: linesToArray(values.responsibilities), requirements: linesToArray(values.requirements),
    qualifications: linesToArray(values.qualifications), skills: commaToArray(values.skills), benefits: linesToArray(values.benefits), deadline: values.deadline,
    vacancyCount: Number(values.vacancyCount), applicationMethod: values.applicationMethod, applicationUrl: values.applicationUrl || undefined,
    isUrgent: values.isUrgent, featureRequested: values.requestFeatured, screeningQuestions: (values.questions || []).map((item) => ({ question: item.question, required: true })),
    submitAction, // 'draft' or 'submit' - the server decides whether submit means PENDING_APPROVAL or PUBLISHED
  };
}

function Section({ title, children }) {
  return <section className="card p-5 sm:p-6"><h2 className="mb-4 font-sans text-base font-semibold">{title}</h2>{children}</section>;
}

// Used by employers (create/edit own jobs) and by admins (edit any job from the moderation table).
export default function PostJobPage() {
  const { jobId } = useParams();
  const isEdit = Boolean(jobId);
  useDocumentTitle(isEdit ? 'Edit job' : 'Post a job');
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();

  const { register, control, handleSubmit, reset, watch, formState: { errors } } = useForm({ resolver: zodResolver(jobSchema), defaultValues: DEFAULTS });
  const { fields: questionFields, append, remove } = useFieldArray({ control, name: 'questions' });
  const applicationMethod = watch('applicationMethod');

  const existing = useQuery({ queryKey: ['job', 'edit', jobId], queryFn: () => jobService.getById(jobId), enabled: isEdit, select: (res) => res.data });
  useEffect(() => { if (existing.data) reset(jobToForm(existing.data)); }, [existing.data, reset]);

  const backTo = isAdmin ? '/admin/jobs' : '/employer/jobs';
  const save = useActionMutation(({ values, submitAction }) => {
    const payload = formToPayload(values, submitAction);
    return isEdit ? jobService.update(jobId, payload) : jobService.create(payload);
  }, {
    success: (response) => response.message || 'Job saved.',
    invalidate: [['employer-jobs'], ['employer-dashboard'], ['admin', 'jobs'], ['job']],
    onSuccess: () => navigate(backTo),
  });
  const submitWith = (submitAction) => handleSubmit((values) => save.mutate({ values, submitAction }));

  if (isEdit && existing.isLoading) return <Skeleton className="h-96 max-w-4xl" />;
  if (isEdit && existing.isError) return <ErrorState message={existing.error.message} onRetry={existing.refetch} />;

  return (
    <div className="max-w-4xl">
      <PageHeader title={isEdit ? 'Edit job' : 'Post a job'} description="Fields marked * are required. Jobs may wait for admin approval before they appear in search." />
      <form className="space-y-6" noValidate onSubmit={submitWith('submit')}>
        <Section title="Basic information">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Job title" required wrapperClassName="sm:col-span-2" error={errors.title?.message} {...register('title')} />
            <Select label="Category" required placeholder="Select category" options={categories.map((item) => ({ value: item._id, label: item.name }))} error={errors.category?.message} {...register('category')} />
            <Select label="Location" required placeholder="Select location" options={locations.map((item) => ({ value: item._id, label: `${item.city}, ${item.country}` }))} error={errors.location?.message} {...register('location')} />
            <Select label="Workplace type" required options={WORKPLACE_TYPES} error={errors.workplaceType?.message} {...register('workplaceType')} />
            <Select label="Job type" required options={JOB_TYPES} error={errors.jobType?.message} {...register('jobType')} />
          </div>
        </Section>

        <Section title="Compensation, experience and education">
          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Minimum salary (NPR)" type="number" min="0" error={errors.salaryMin?.message} {...register('salaryMin')} />
            <Input label="Maximum salary (NPR)" type="number" min="0" error={errors.salaryMax?.message} {...register('salaryMax')} />
            <Select label="Salary period" options={SALARY_PERIODS} {...register('salaryPeriod')} />
            <div className="sm:col-span-3"><Checkbox label="Salary is negotiable" {...register('salaryNegotiable')} /></div>
            <Input label="Minimum experience (years)" type="number" min="0" error={errors.experienceMin?.message} {...register('experienceMin')} />
            <Input label="Maximum experience (years)" type="number" min="0" error={errors.experienceMax?.message} {...register('experienceMax')} />
            <Select label="Minimum education" required options={EDUCATION_LEVELS} error={errors.education?.message} {...register('education')} />
          </div>
        </Section>

        <Section title="Job content">
          <div className="space-y-4">
            <Textarea label="Description" required rows={6} error={errors.description?.message} {...register('description')} />
            <Textarea label="Responsibilities" required rows={5} hint="One item per line." error={errors.responsibilities?.message} {...register('responsibilities')} />
            <Textarea label="Requirements" required rows={5} hint="One item per line." error={errors.requirements?.message} {...register('requirements')} />
            <Textarea label="Qualifications" rows={3} hint="One item per line." {...register('qualifications')} />
            <Input label="Skills" required hint="Separate with commas, e.g. React, Node.js, MongoDB" error={errors.skills?.message} {...register('skills')} />
            <Textarea label="Benefits" rows={3} hint="One item per line." {...register('benefits')} />
          </div>
        </Section>

        <Section title="Application">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Application deadline" type="date" required min={new Date().toISOString().slice(0, 10)} error={errors.deadline?.message} {...register('deadline')} />
            <Input label="Number of vacancies" type="number" min="1" required error={errors.vacancyCount?.message} {...register('vacancyCount')} />
            <Select label="Application method" options={APPLICATION_METHODS} {...register('applicationMethod')} />
            {applicationMethod !== 'PLATFORM' && <Input label={applicationMethod === 'EMAIL' ? 'Email address' : 'Application link'} required error={errors.applicationUrl?.message} {...register('applicationUrl')} />}
          </div>
          {applicationMethod === 'PLATFORM' && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-semibold">Screening questions (optional)</h3><Button variant="outline" size="sm" onClick={() => append({ question: '' })}><Plus className="h-4 w-4" aria-hidden="true" /> Add question</Button></div>
              <div className="space-y-3">
                {questionFields.map((field, index) => (
                  <div key={field.id} className="flex items-start gap-2">
                    <Input aria-label={`Question ${index + 1}`} wrapperClassName="flex-1" placeholder="e.g. How many years have you used React?" error={errors.questions?.[index]?.question?.message} {...register(`questions.${index}.question`)} />
                    <Button variant="ghost" size="sm" className="mt-1 !text-red-600" aria-label="Remove question" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section title="Options">
          <div className="space-y-2"><Checkbox label="Mark as urgent hiring" {...register('isUrgent')} /><Checkbox label="Request featured placement (needs admin approval)" {...register('requestFeatured')} /></div>
        </Section>

        <div className="sticky bottom-0 -mx-4 flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          <Button variant="outline" onClick={() => navigate(backTo)} disabled={save.isPending}>Cancel</Button>
          {!isAdmin && <Button variant="outline" loading={save.isPending} onClick={submitWith('draft')}>Save as draft</Button>}
          <Button type="submit" loading={save.isPending}>{isEdit ? 'Save changes' : 'Submit job'}</Button>
        </div>
      </form>
    </div>
  );
}
