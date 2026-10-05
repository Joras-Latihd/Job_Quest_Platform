import { useEffect, useRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { Camera } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import TagInput from '@/components/common/TagInput';
import ProfileCompletion from '@/components/common/ProfileCompletion';
import RepeatableSection from '@/components/common/RepeatableSection';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { authService } from '@/services/authService';
import { userService } from '@/services/userService';
import { profileSchema } from '@/schemas/profileSchemas';
import { useAuthStore } from '@/store/authStore';
import { JOB_TYPES, LANGUAGE_LEVELS, FILE_RULES } from '@/constants';
import { profileToFormValues } from '@/utils/profile';
import { validateFile } from '@/utils/validators';
import { toast } from '@/utils/toast';

const SKILL_SUGGESTIONS = ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Python', 'Excel', 'Accounting', 'Communication'];
const toNumber = (value) => (value === '' || value == null ? undefined : Number(value));
const clean = (items = []) => items.map((item) => Object.fromEntries(Object.entries(item).filter(([key, value]) => value !== '' && key !== '_id' || key === '_id' && value)));

export default function ProfilePage() {
  useDocumentTitle('My profile');
  const setUser = useAuthStore((state) => state.setUser);
  const imageInput = useRef(null);
  const { data: profile, isLoading, isError, refetch } = useQuery({ queryKey: ['profile'], queryFn: authService.me, select: (res) => res.data });
  const form = useForm({ resolver: zodResolver(profileSchema), defaultValues: { skills: [], education: [], experience: [], languages: [], certifications: [], projects: [], socialLinks: {} } });
  const { register, control, handleSubmit, reset, formState: { errors, isDirty } } = form;

  useEffect(() => { if (profile) reset(profileToFormValues(profile)); }, [profile, reset]);

  const save = useActionMutation((values) => userService.updateProfile({
    ...values,
    yearsOfExperience: toNumber(values.yearsOfExperience),
    expectedSalary: toNumber(values.expectedSalary),
    dateOfBirth: values.dateOfBirth || undefined,
    education: clean(values.education), experience: clean(values.experience), certifications: clean(values.certifications),
    projects: clean(values.projects), languages: clean(values.languages),
  }), {
    success: 'Profile saved.', invalidate: [['profile'], ['seeker-dashboard']],
    onSuccess: (response) => setUser(response.data),
  });

  const avatar = useActionMutation(userService.uploadAvatar, {
    success: 'Photo updated.', invalidate: [['profile']],
    onSuccess: () => authService.me().then((res) => setUser(res.data)),
  });
  const onPhotoChosen = (event) => {
    const file = event.target.files[0];
    event.target.value = '';
    const problem = file && validateFile(file, FILE_RULES.image);
    if (problem) return toast.error(problem);
    return file && avatar.mutate(file);
  };

  if (isError) return <ErrorState onRetry={refetch} />;
  if (isLoading || !profile) return <div className="space-y-4"><Skeleton className="h-40" /><Skeleton className="h-64" /></div>;

  return (
    <div className="max-w-4xl">
      <PageHeader title="My profile" description="Employers see this profile when you apply. Only name and headline are public; contact details are shared only with jobs you apply to." />
      <form onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-6" noValidate>
        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">Personal information</h2>
          <div className="mb-5 flex items-center gap-4">
            <Avatar src={profile.profileImage} name={profile.name} size="xl" />
            <div>
              <Button variant="outline" size="sm" onClick={() => imageInput.current.click()} loading={avatar.isPending}><Camera className="h-4 w-4" aria-hidden="true" /> Change photo</Button>
              <p className="mt-1 text-xs text-slate-500">{FILE_RULES.image.label}</p>
              <input ref={imageInput} type="file" accept=".jpg,.jpeg,.png,.webp" className="sr-only" tabIndex={-1} onChange={onPhotoChosen} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name" required error={errors.name?.message} {...register('name')} />
            <Input label="Email" value={profile.email} disabled readOnly hint="Email cannot be changed here." />
            <Input label="Phone" type="tel" {...register('phone')} />
            <Input label="Location" placeholder="Kathmandu, Nepal" {...register('location')} />
            <Input label="Date of birth (optional)" type="date" {...register('dateOfBirth')} />
          </div>
          <Textarea label="Bio" rows={4} className="mt-4" error={errors.bio?.message} {...register('bio')} />
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">Professional information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Professional headline" placeholder="Junior React Developer" wrapperClassName="sm:col-span-2" error={errors.headline?.message} {...register('headline')} />
            <Input label="Current position" {...register('currentPosition')} />
            <Input label="Years of experience" type="number" min="0" step="0.5" {...register('yearsOfExperience')} />
            <Input label="Expected salary (NPR / month)" type="number" min="0" {...register('expectedSalary')} />
            <Input label="Preferred location" {...register('preferredLocation')} />
            <Select label="Job type preference" placeholder="No preference" options={JOB_TYPES} {...register('jobTypePreference')} />
          </div>
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">Skills</h2>
          <Controller control={control} name="skills" render={({ field }) => <TagInput value={field.value || []} onChange={field.onChange} suggestions={SKILL_SUGGESTIONS} />} />
        </section>

        <RepeatableSection control={control} register={register} errors={errors} name="education" title="Education" addLabel="Add education" blank={{ degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }}
          fields={[{ name: 'degree', label: 'Degree', required: true }, { name: 'institution', label: 'Institution', required: true }, { name: 'fieldOfStudy', label: 'Field of study' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date', type: 'date' }, { name: 'description', label: 'Description', type: 'textarea', full: true }]} />

        <RepeatableSection control={control} register={register} errors={errors} name="experience" title="Experience" addLabel="Add experience" blank={{ company: '', position: '', location: '', startDate: '', endDate: '', description: '' }}
          fields={[{ name: 'company', label: 'Company', required: true }, { name: 'position', label: 'Position', required: true }, { name: 'location', label: 'Location' }, { name: 'startDate', label: 'Start date', type: 'date' }, { name: 'endDate', label: 'End date (leave empty if current)', type: 'date' }, { name: 'description', label: 'Description', type: 'textarea', full: true }]} />

        <RepeatableSection control={control} register={register} errors={errors} name="languages" title="Languages" addLabel="Add language" blank={{ language: '', proficiency: 'Fluent' }}
          fields={[{ name: 'language', label: 'Language', required: true }, { name: 'proficiency', label: 'Proficiency', type: 'select', options: LANGUAGE_LEVELS }]} />

        <RepeatableSection control={control} register={register} errors={errors} name="certifications" title="Certifications" addLabel="Add certification" blank={{ name: '', issuer: '', issueDate: '', url: '' }}
          fields={[{ name: 'name', label: 'Certification', required: true }, { name: 'issuer', label: 'Issued by' }, { name: 'issueDate', label: 'Issue date', type: 'date' }, { name: 'url', label: 'Credential link' }]} />

        <RepeatableSection control={control} register={register} errors={errors} name="projects" title="Projects" addLabel="Add project" blank={{ title: '', url: '', description: '' }}
          fields={[{ name: 'title', label: 'Project title', required: true }, { name: 'url', label: 'Project link' }, { name: 'description', label: 'Description', type: 'textarea', full: true }]} />

        <section className="card p-5 sm:p-6">
          <h2 className="mb-4 font-sans text-base font-semibold">Social links</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="LinkedIn" placeholder="https://" error={errors.socialLinks?.linkedin?.message} {...register('socialLinks.linkedin')} />
            <Input label="GitHub" placeholder="https://" error={errors.socialLinks?.github?.message} {...register('socialLinks.github')} />
            <Input label="Portfolio" placeholder="https://" error={errors.socialLinks?.portfolio?.message} {...register('socialLinks.portfolio')} />
            <Input label="Other" placeholder="https://" error={errors.socialLinks?.other?.message} {...register('socialLinks.other')} />
          </div>
        </section>

        <ProfileCompletion user={profile} />
        <div className="sticky bottom-0 -mx-4 flex items-center justify-end gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
          {Object.keys(errors).length > 0 && <p role="alert" className="mr-auto text-sm text-red-600">Please fix the highlighted fields.</p>}
          <Button type="button" variant="outline" disabled={!isDirty} onClick={() => reset(profileToFormValues(profile))}>Discard changes</Button>
          <Button type="submit" loading={save.isPending} disabled={!isDirty}>Save profile</Button>
        </div>
      </form>
    </div>
  );
}
