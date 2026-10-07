import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, ExternalLink, FileText } from 'lucide-react';
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
import { formatDate, formatFileSize } from '@/utils/format';
import { cn } from '@/utils/cn';

/*
 * Application flow (a real-world style wizard):
 *  Profile -> Resume -> Cover letter -> Employer questions (only if the job has some) -> Review -> Success screen
 */
export default function ApplyModal({ open, onClose, job }) {
  const setUser = useAuthStore((state) => state.setUser);
  const questions = job.screeningQuestions || [];
  const steps = ['Profile', 'Resume', 'Cover letter', ...(questions.length ? ['Questions'] : []), 'Review'];

  const [stepIndex, setStepIndex] = useState(0);
  const [resumeId, setResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState('');
  const [submittedId, setSubmittedId] = useState(null);

  // Always load the latest profile when the window opens (the user may just have edited it in another tab).
  const { data: profile, isLoading, refetch, isFetching } = useQuery({ queryKey: ['apply-profile'], queryFn: authService.me, enabled: open, select: (res) => res.data });
  const resumes = profile?.resumes || [];

  useEffect(() => {
    if (open) { setStepIndex(0); setError(''); setSubmittedId(null); }
  }, [open]);

  useEffect(() => {
    if (!resumeId && resumes.length) setResumeId((resumes.find((item) => item.isDefault) || resumes[0])._id);
  }, [resumes, resumeId]);

  const syncProfile = async () => {
    const { data } = await refetch();
    if (data) setUser(data);
  };

  const uploadResume = useActionMutation(userService.uploadResume, {
    success: 'Resume uploaded.',
    onSuccess: async (response) => {
      await syncProfile();
      setResumeId(response.data?._id || '');
      setError('');
    },
  });

  const submit = useActionMutation(
    () => applicationService.apply({
      job: job._id,
      resume: resumeId,
      coverLetter,
      answers: questions.map((item) => ({ question: item.question, answer: answers[item._id] || '' })),
    }),
    {
      invalidate: [['job'], ['jobs'], ['applications'], ['seeker-dashboard'], ['notifications']],
      onSuccess: (response) => setSubmittedId(response.data?._id || 'done'),
    },
  );

  const current = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;
  const { percent, missing } = calcProfileCompletion(profile);
  const selectedResume = resumes.find((item) => item._id === resumeId);
  const busy = submit.isPending || uploadResume.isPending;

  const next = () => {
    setError('');
    if (current === 'Resume' && !resumeId) return setError('Choose a resume or upload a new one to continue.');
    if (current === 'Questions') {
      const unanswered = questions.find((item) => item.required && !answers[item._id]?.trim());
      if (unanswered) return setError(`Please answer: "${unanswered.question}"`);
    }
    return setStepIndex((value) => value + 1);
  };

  const insertTemplate = () => setCoverLetter(
    `Dear Hiring Manager,\n\nI am writing to apply for the ${job.title} position at ${job.company?.name || 'your company'}. `
    + `With my background${profile?.headline ? ` as ${profile.headline}` : ''}, I believe I can contribute to your team from day one.\n\n`
    + 'I would welcome the chance to discuss how my skills match your needs. Thank you for your time and consideration.\n\n'
    + `Sincerely,\n${profile?.name || ''}`,
  );

  // ---------- success screen ----------
  if (submittedId) {
    return (
      <Modal open={open} onClose={onClose} title="Application sent" size="sm" footer={(
        <>
          <Button variant="outline" onClick={onClose}>Keep browsing</Button>
          <Button as={Link} to={submittedId === 'done' ? '/dashboard/applications' : `/dashboard/applications/${submittedId}`} onClick={onClose}>View my application</Button>
        </>
      )}>
        <div className="flex flex-col items-center py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2 className="h-8 w-8" aria-hidden="true" /></span>
          <h3 className="mt-4 text-lg font-semibold">Application submitted successfully</h3>
          <p className="mt-1 text-sm text-slate-600">Your application for <strong>{job.title}</strong> at {job.company?.name} is with the employer. We will notify you when its status changes.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={open}
      onClose={busy ? () => {} : onClose}
      title={`Apply for ${job.title}`}
      footer={(
        <>
          {stepIndex > 0 && <Button variant="outline" disabled={busy} onClick={() => { setError(''); setStepIndex(stepIndex - 1); }}>Back</Button>}
          {isLast
            ? <Button onClick={() => { setError(''); submit.mutate(); }} loading={submit.isPending} disabled={!resumeId}>Submit application</Button>
            : <Button onClick={next} disabled={busy || isLoading}>Continue</Button>}
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

      {isLoading || !profile ? <div className="flex justify-center py-10"><Spinner className="h-8 w-8" /></div> : (
        <div className="space-y-4">
          {current === 'Profile' && (
            <div>
              <h3 className="text-base font-semibold">Confirm your details</h3>
              <p className="text-sm text-slate-500">The employer will see these details with your application.</p>
              <dl className="mt-3 grid gap-3 rounded-xl bg-slate-50 p-4 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Name</dt><dd className="font-medium">{profile.name}</dd></div>
                <div><dt className="text-slate-500">Email</dt><dd className="font-medium">{profile.email}</dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd className="font-medium">{profile.phone || <span className="text-amber-700">Not added</span>}</dd></div>
                <div><dt className="text-slate-500">Headline</dt><dd className="font-medium">{profile.headline || <span className="text-amber-700">Not added</span>}</dd></div>
              </dl>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm"><span className="font-medium">Profile {percent}% complete</span></div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Profile completion"><div className="h-full rounded-full bg-brand-600" style={{ width: `${percent}%` }} /></div>
                {missing.length > 0 && <p className="mt-2 text-xs text-slate-500">A fuller profile helps employers. Missing: {missing.join(', ')}.</p>}
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                <a href="/dashboard/profile" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">Edit profile in a new tab <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>
                <button type="button" onClick={syncProfile} disabled={isFetching} className="font-medium text-slate-600 hover:underline">{isFetching ? 'Refreshing...' : 'Refresh details'}</button>
              </div>
            </div>
          )}

          {current === 'Resume' && (
            <div>
              <h3 className="text-base font-semibold">Choose a resume</h3>
              <p className="text-sm text-slate-500">A copy of the selected file is sent to the employer.</p>
              {resumes.length > 0 ? (
                <ul className="mt-3 space-y-2">
                  {resumes.map((resume) => (
                    <li key={resume._id}>
                      <label className={cn('flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm', resumeId === resume._id ? 'border-brand-500 bg-brand-50' : 'border-slate-200')}>
                        <input type="radio" name="resume" checked={resumeId === resume._id} onChange={() => { setResumeId(resume._id); setError(''); }} className="h-4 w-4 text-brand-600" />
                        <FileText className="h-5 w-5 shrink-0 text-slate-500" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-medium">{resume.name}</span>
                          <span className="block text-xs text-slate-500">{formatFileSize(resume.size)} &middot; uploaded {formatDate(resume.uploadedAt)}{resume.isDefault ? ' \u00b7 default' : ''}</span>
                        </span>
                        <a href={resume.url} target="_blank" rel="noreferrer noopener" onClick={(event) => event.stopPropagation()} className="text-xs font-medium text-brand-600 hover:underline">Preview</a>
                      </label>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">You have no resume on file yet. Upload one below to continue.</p>}
              <div className="mt-4"><FileDropzone rules={FILE_RULES.resume} loading={uploadResume.isPending} label={resumes.length ? 'Upload a different resume' : 'Upload your resume'} onFile={(file) => uploadResume.mutate(file)} /></div>
            </div>
          )}

          {current === 'Cover letter' && (
            <div>
              <Textarea label="Cover letter (optional)" rows={9} value={coverLetter} maxLength={3000} onChange={(event) => setCoverLetter(event.target.value)} hint={`${coverLetter.length}/3000 characters. Explain why you are a good fit for this role.`} />
              <button type="button" onClick={insertTemplate} className="mt-2 text-sm font-medium text-brand-600 hover:underline">Insert a sample cover letter</button>
            </div>
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
                <div><dt className="text-slate-500">Resume</dt><dd className="flex items-center gap-1.5 font-medium"><CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />{selectedResume?.name || 'No resume selected'}</dd></div>
                <div><dt className="text-slate-500">Cover letter</dt><dd className="line-clamp-4 whitespace-pre-line">{coverLetter || 'Not added'}</dd></div>
                {questions.length > 0 && <div><dt className="text-slate-500">Employer questions</dt><dd>{questions.filter((item) => answers[item._id]?.trim()).length} of {questions.length} answered</dd></div>}
              </dl>
              <p className="mt-3 text-xs text-slate-500">By submitting, you agree to share your profile and resume with {job.company?.name}. You can withdraw this application later from your dashboard.</p>
            </div>
          )}

          {(error || submit.error) && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error || submit.error.message}</p>}
        </div>
      )}
    </Modal>
  );
}
