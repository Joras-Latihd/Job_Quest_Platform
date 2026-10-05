import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '@/components/ui/PageHeader';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ApplicationStatus from '@/components/common/ApplicationStatus';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { applicationService } from '@/services/applicationService';
import { APPLICATION_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

export default function ApplicationDetailPage() {
  useDocumentTitle('Application');
  const { applicationId } = useParams();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { data: application, isLoading, isError, error, refetch } = useQuery({ queryKey: ['applications', 'detail', applicationId], queryFn: () => applicationService.getById(applicationId), select: (res) => res.data });
  const withdraw = useActionMutation(() => applicationService.withdraw(applicationId), {
    success: 'Application withdrawn.', invalidate: [['applications'], ['seeker-dashboard']], onSuccess: () => setConfirmOpen(false),
  });

  if (isLoading) return <Skeleton className="h-96 max-w-4xl" />;
  if (isError) return <ErrorState message={error.message} onRetry={refetch} />;
  const canWithdraw = !['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(application.status);

  return (
    <div className="max-w-4xl space-y-6">
      <PageHeader title={application.job?.title} description={`${application.job?.company?.name} - applied ${formatDate(application.appliedAt)}`} actions={<><Button as={Link} to={`/jobs/${application.job?._id}`} variant="outline">View job</Button>{canWithdraw && <Button variant="outline" className="!text-red-600" onClick={() => setConfirmOpen(true)}>Withdraw</Button>}</>} />
      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-5"><h2 className="mb-4 font-sans text-base font-semibold">Progress</h2><ApplicationStatus status={application.status} history={application.statusHistory} /></section>
        <section className="card space-y-4 p-5 text-sm">
          <h2 className="font-sans text-base font-semibold">Application</h2>
          <div><p className="text-slate-500">Current status</p><StatusBadge status={application.status} options={APPLICATION_STATUSES} /></div>
          <div><p className="text-slate-500">Resume used</p><p className="font-medium">{application.resume?.name || '-'}</p></div>
          {application.interview && <div><p className="text-slate-500">Interview</p><p className="font-medium">{formatDate(application.interview.scheduledAt, true)}</p><p className="text-slate-600">{application.interview.locationOrLink}</p></div>}
          {application.coverLetter && <div><p className="text-slate-500">Cover letter</p><p className="whitespace-pre-line">{application.coverLetter}</p></div>}
        </section>
      </div>
      <ConfirmDialog open={confirmOpen} title="Withdraw application?" message="The employer will no longer consider this application. You cannot apply again to the same job." confirmLabel="Withdraw" danger loading={withdraw.isPending} onConfirm={() => withdraw.mutate()} onCancel={() => setConfirmOpen(false)} />
    </div>
  );
}
