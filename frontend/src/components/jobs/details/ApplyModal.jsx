import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, FileText } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import Spinner from '@/components/ui/Spinner';
import FileDropzone from '@/components/common/FileDropzone';
import useActionMutation from '@/hooks/useActionMutation';
import { authService } from '@/services/authService';
import { applicationService } from '@/services/applicationService';
import { userService } from '@/services/userService';
import { useAuthStore } from '@/store/authStore';
import { FILE_RULES } from '@/constants';
import { calcProfileCompletion } from '@/utils/profile';
import { cn } from '@/utils/cn';

/*
 * Multi-step application:
 *  1 Confirm profile  2 Choose resume  3 Cover letter  4 Employer questions (only if the job has some)  5 Review & submit
 */
export default function ApplyModal({ open, onClose, job }) {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const questions = job.screeningQuestions || [];
  const steps = ['Profile', 'Resume', 'Cover letter', ...(questions.length ? ['Questions'] : []), 'Review'];

  const [stepIndex, setStepIndex] = useState(0);
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');

  // Fresh profile data every time the modal opens (the user may have just uploaded a resume).
  const { data: profile, isLoading, refetch } = useQuery({ queryKey: ['apply-profile'], queryFn: authService.me, enabled: open, select: (res) => res.data });
  const resumes = profile?.resumes || [];

  useEffect(() => {
    if (open) { setStepIndex(0); setError(''); }
  }, [open]);
  useEffect(() => {
    if (!resumeId && resumes.length) setResumeId((resumes.find((item) => item.isDefault) || resumes[0])._id);
  }, [resumes, resumeId]);

  const uploadResume = useActionMutation(userService.uploadResume, {
    success: 'Resume uploaded.',
    onSuccess: (response) => { refetch().then(({ data }) => data && setUser(data)); setResumeId(response.data?._id || ''); },
  });

  const submit = useActionMutation(
    () => applicationService.apply({ job: job._id, resume: resumeId, coverLetter, answers: questions.map((item) => ({ question: item.question, answer: answers[item._id] || '' })) }),
    {
      success: 'Application submitted successfully.',
      invalidate: [['job', job._id], ['applications'], ['seeker-dashboard']],
      onSuccess: () => onClose(),
    },
  );

  const current = steps[stepIndex];
  const { percent } = calcProfileCompletion(profile);

  const next = () => {
    setError('');
    if (current === 'Resume' && !resumeId) return setError('Choose or upload a resume to continue.');
    if (current === 'Questions') {
      const missing = questions.find((item) => item.required && !answers[item._id]?.trim());
      if (missing) return setError('Please answer all required questions.');
    }
    return setStepIndex((value) => value + 1);
  };

  const selectedResume = resumes.find((item) => item._id === resumeId);
  const isLast = stepIndex === steps.length - 1;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      footer={(
        <>
          {stepIndex > 0 && <Button variant="outline" onClick={() => { setError(''); setStepIndex(stepIndex - 1); }}>Back</Button>}
          {isLast
            ? <Button onClick={() => submit.mutate()} loading={submit.isPending}>Submit application</Button>
            : <Button onClick={next}>Continue</Button>}
        </>
      )}
    >
      <ol className="mb-5 flex items-center gap-1.5" aria-label="Application steps">
        {steps.map((label, index) => (
          <li key={label} className="flex flex-1 flex-col gap-1" aria-current={index === stepIndex ? 'step' : undefined}>
            <span className={cn('h-1.5 rounded-full', index <= stepIndex ? 'bg-brand-600' : 'bg-slate-200')} />
            <span className={cn('hidden text-xs sm:block', index === stepIndex ? 'font-semibold text-brand-700' : 'text-slate-400')}>{label}</span>
          </li>
        ))}
      </ol>
      <p className="mb-4 text-sm text-slate-500 sm:hidden">Step {stepIndex + 1} of {steps.length}: {current}</p>

      {isLoading ? <div className="flex justify-center py-10"><Spinner className="h-8 w-8" /></div> : (
        <div className="space-y-4">
          {current === 'Profile' && (
            <div>
              <h3 className="text-base font-semibold">Confirm your details</h3>
              <dl className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{profile.name}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{profile.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{profile.phone || 'Not added'}</dd></div>
                <div><dt className="text-slate-500">Headline</dt><dd className="font-medium">{profile.headline || 'Not added'}</dd></div>
              </dl>
              <p className="mt-3 text-sm text-slate-600">Your profile is {percent}% complete. Employers see your profile with this application. <Link to="/dashboard/profile" className="font-medium text-brand-600 hover:underline">Update profile</Link></p>
            </div>
          )}

          {current === 'Resume' && (
            <div>
              <h3 className="text-base font-semibold">Choose a resume</h3>
              {resumes.length > 0 && (
                <ul className="mt-3 space-y-2">
                  {resumes.map((resume) => (
                    <li key={resume._id}>
                      <label className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm', resumeId === resume._id ? 'border-brand-500 bg-brand-50' : 'border-slate-200')}>
                        <input type="radio" name="resume" checked={resumeId === resume._id} onChange={() => setResumeId(resume._id)} className="h-4 w-4 text-brand-600" />
                        <FileText className="h-4 w-4 text-slate-500" aria-hidden="true" />
                        <span className="min-w-0 flex-1 truncate">{resume.name}</span>
                        {resume.isDefault && <span className="text-xs text-brand-700">Default</span>}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-4"><FileDropzone rules={FILE_RULES.resume} loading={uploadResume.isPending} label="Upload a new resume" onFile={(file) => uploadResume.mutate(file)} /></div>
            </div>
          )}

          {current === 'Cover letter' && (
            <Textarea label="Cover letter (optional)" rows={8} value={coverLetter} maxLength={3000} onChange={(event) => setCoverLetter(event.target.value)} hint={`${coverLetter.length}/3000 characters. Explain why you are a good fit for this role.`} />
          )}

          {current === 'Questions' && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Questions from the employer</h3>
              {questions.map((item) => (
                <Textarea key={item._id} label={item.question} required={item.required} rows={3} value={answers[item._id] || ''} onChange={(event) => setAnswers({ ...answers, [item._id]: event.target.value })} />
              ))}
            </div>
          )}

          {current === 'Review' && (
            <div>
              <h3 className="text-base font-semibold">Review your application</h3>
              <dl className="mt-3 space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
                <div><dt className="text-slate-500">Job</dt><dd className="font-medium">{job.title} at {job.company?.name}</dd></div>
                <div><dt className="text-slate-500">Applicant</dt><dd className="font-medium">{profile.name} ({profile.email})</dd></div>
                <div><dt className="text-slate-500">Resume</dt><dd className="flex items-center gap-1.5 font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />{selectedResume?.name}</dd></div>
                <div><dt className="text-slate-500">Cover letter</dt><dd className="line-clamp-4 whitespace-pre-line">{coverLetter || 'Not added'}</dd></div>
              </dl>
              <p className="mt-3 text-xs text-slate-500">You can track this application from your dashboard and withdraw it any time before a final decision.</p>
            </div>
          )}
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Modal>
  );
}
