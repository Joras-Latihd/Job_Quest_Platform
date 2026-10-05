import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Download } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import StatusBadge from '@/components/ui/StatusBadge';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import ApplicationStatus from '@/components/common/ApplicationStatus';
import InterviewModal from '@/components/employer/InterviewModal';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { applicationService } from '@/services/applicationService';
import { APPLICATION_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

function Block({ title, children }) {
  return <section className="card p-5"><h2 className="mb-3 font-sans text-base font-semibold">{title}</h2>{children}</section>;
}

export default function ApplicationReviewPage() {
  useDocumentTitle('Review application');
  const { applicationId } = useParams();
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [interviewOpen, setInterviewOpen] = useState(false);
  const { data: application, isLoading, isError, error, refetch } = useQuery({ queryKey: ['applications', 'detail', applicationId], queryFn: () => applicationService.getById(applicationId), select: (res) => res.data });
  const update = useActionMutation(() => applicationService.updateStatus(applicationId, { status, note: note || undefined }), {
    success: 'Status updated. The candidate has been notified.', invalidate: [['applications'], ['employer-dashboard']], onSuccess: () => setNote(''),
  });

  if (isLoading) return <Skeleton className="h-96 max-w-5xl" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  const candidate = application.candidate;
  const currentStatus = status || application.status;
  const locked = application.status === 'WITHDRAWN';

  return (
    <div className="max-w-5xl space-y-6">
      <PageHeader title={candidate.name} description={`Applied for ${application.job?.title} on ${formatDate(application.appliedAt)}`} actions={<><Button as={Link} to={`/employer/jobs/${application.job?._id}/applicants`} variant="outline">Back to applicants</Button>{application.resume?.url && <Button as="a" href={application.resume.url} target="_blank" rel="noreferrer noopener"><Download className="h-4 w-4" aria-hidden="true" /> Download resume</Button>}</>} />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Block title="Candidate">
            <div className="flex items-start gap-4">
              <Avatar src={candidate.profileImage} name={candidate.name} size="xl" />
              <dl className="grid flex-1 gap-2 text-sm sm:grid-cols-2">
                <div><dt className="text-slate-500">Email</dt><dd><a href={`mailto:${candidate.email}`} className="text-brand-600 hover:underline">{candidate.email}</a></dd></div>
                <div><dt className="text-slate-500">Phone</dt><dd>{candidate.phone || '-'}</dd></div>
                <div><dt className="text-slate-500">Location</dt><dd>{candidate.location || '-'}</dd></div>
                <div><dt className="text-slate-500">Experience</dt><dd>{candidate.yearsOfExperience != null ? `${candidate.yearsOfExperience} years` : '-'}</dd></div>
              </dl>
            </div>
            {candidate.headline && <p className="mt-4 font-medium">{candidate.headline}</p>}
            {candidate.bio && <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{candidate.bio}</p>}
          </Block>

          {candidate.skills?.length > 0 && <Block title="Skills"><div className="flex flex-wrap gap-2">{candidate.skills.map((skill) => <Badge key={skill} tone="blue">{skill}</Badge>)}</div></Block>}

          {candidate.experience?.length > 0 && (
            <Block title="Experience"><ul className="space-y-4">{candidate.experience.map((item, index) => <li key={index}><p className="font-medium">{item.position} at {item.company}</p><p className="text-xs text-slate-500">{formatDate(item.startDate)} - {item.endDate ? formatDate(item.endDate) : 'Present'}</p>{item.description && <p className="mt-1 text-sm text-slate-600">{item.description}</p>}</li>)}</ul></Block>
          )}
          {candidate.education?.length > 0 && (
            <Block title="Education"><ul className="space-y-3">{candidate.education.map((item, index) => <li key={index}><p className="font-medium">{item.degree}{item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ''}</p><p className="text-sm text-slate-600">{item.institution}</p></li>)}</ul></Block>
          )}
          {candidate.projects?.length > 0 && (
            <Block title="Projects"><ul className="space-y-3">{candidate.projects.map((item, index) => <li key={index}><p className="font-medium">{item.title}</p>{item.description && <p className="text-sm text-slate-600">{item.description}</p>}{item.url && <a href={item.url} target="_blank" rel="noreferrer noopener" className="text-sm text-brand-600 hover:underline">{item.url}</a>}</li>)}</ul></Block>
          )}

          <Block title="Cover letter">{application.coverLetter ? <p className="whitespace-pre-line text-sm text-slate-700">{application.coverLetter}</p> : <p className="text-sm text-slate-500">No cover letter was included.</p>}</Block>

          {application.answers?.length > 0 && (
            <Block title="Answers to your questions"><dl className="space-y-3 text-sm">{application.answers.map((item, index) => <div key={index}><dt className="font-medium">{item.question}</dt><dd className="text-slate-600">{item.answer || '-'}</dd></div>)}</dl></Block>
          )}
        </div>

        <div className="space-y-6">
          <Block title="Status">
            <p className="mb-3"><StatusBadge status={application.status} options={APPLICATION_STATUSES} /></p>
            <ApplicationStatus status={application.status} history={application.statusHistory} />
            {!locked && (
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
                <Select label="Change status" options={APPLICATION_STATUSES.filter((item) => item.value !== 'WITHDRAWN')} value={currentStatus} onChange={(event) => setStatus(event.target.value)} />
                <Textarea label="Note (optional)" rows={2} value={note} onChange={(event) => setNote(event.target.value)} />
                <Button className="w-full" onClick={() => update.mutate()} loading={update.isPending} disabled={currentStatus === application.status && !note}>Update status</Button>
                <Button variant="outline" className="w-full" onClick={() => setInterviewOpen(true)}>Schedule interview</Button>
              </div>
            )}
            {locked && <p className="mt-4 text-sm text-slate-500">The candidate withdrew this application.</p>}
          </Block>
          {application.interview && <Block title="Interview"><p className="text-sm font-medium">{formatDate(application.interview.scheduledAt, true)}</p><p className="text-sm text-slate-600">{application.interview.locationOrLink}</p></Block>}
        </div>
      </div>
      <InterviewModal open={interviewOpen} onClose={() => setInterviewOpen(false)} application={application} />
    </div>
  );
}
