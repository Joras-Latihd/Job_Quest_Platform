import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CalendarClock, MapPin, Video, Phone } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Skeleton from '@/components/ui/Skeleton';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { interviewService } from '@/services/engagementService';
import { INTERVIEW_TYPES } from '@/constants';
import { formatDate, labelFor } from '@/utils/format';

const TYPE_ICONS = { PHYSICAL: MapPin, ONLINE: Video, PHONE: Phone };

// Same page for both roles. Employers can cancel; job seekers can only view.
export default function InterviewsPage({ role }) {
  useDocumentTitle('Interviews');
  const isEmployer = role === 'EMPLOYER';
  const query = useQuery({ queryKey: ['interviews'], queryFn: () => interviewService.mine() });
  const cancel = useActionMutation(interviewService.cancel, { success: 'Interview cancelled.', invalidate: [['interviews']] });
  const interviews = query.data?.data || [];

  return (
    <div className="max-w-4xl">
      <PageHeader title="Interviews" description={isEmployer ? 'Interviews you have scheduled with candidates.' : 'Interviews employers have scheduled with you.'} />
      {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? <Skeleton className="h-40" /> : interviews.length === 0 ? (
        <EmptyState icon={CalendarClock} title="No interviews scheduled" description={isEmployer ? 'Open an application and choose Schedule interview.' : 'When an employer schedules an interview it will show up here.'} />
      ) : (
        <ul className="space-y-3">
          {interviews.map((interview) => {
            const Icon = TYPE_ICONS[interview.type] || CalendarClock;
            const isLink = /^https?:\/\//.test(interview.locationOrLink);
            return (
              <li key={interview._id} className="card flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="font-semibold">{interview.job?.title}</p>
                  <p className="text-sm text-slate-600">{isEmployer ? `Candidate: ${interview.candidate?.name}` : interview.job?.company?.name}</p>
                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-700"><CalendarClock className="h-4 w-4 text-slate-400" aria-hidden="true" />{formatDate(interview.scheduledAt, true)}</p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-700"><Icon className="h-4 w-4 text-slate-400" aria-hidden="true" /><Badge tone="blue">{labelFor(INTERVIEW_TYPES, interview.type)}</Badge>
                    {isLink ? <a href={interview.locationOrLink} target="_blank" rel="noreferrer noopener" className="truncate text-brand-600 hover:underline">Open meeting link</a> : <span className="truncate">{interview.locationOrLink}</span>}</p>
                  {interview.notes && <p className="mt-1 text-sm text-slate-500">Note: {interview.notes}</p>}
                </div>
                <div className="flex gap-2">
                  <Button as={Link} to={isEmployer ? `/employer/applications/${interview.application}` : `/dashboard/applications/${interview.application}`} variant="outline" size="sm">View application</Button>
                  {isEmployer && <Button variant="ghost" size="sm" className="text-red-600" onClick={() => cancel.mutate(interview._id)} loading={cancel.isPending}>Cancel</Button>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
