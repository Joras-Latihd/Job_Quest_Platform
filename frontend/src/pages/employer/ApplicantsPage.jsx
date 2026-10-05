import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Pagination from '@/components/ui/Pagination';
import ApplicantCard from '@/components/employer/ApplicantCard';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { applicationService } from '@/services/applicationService';
import { jobService } from '@/services/jobService';
import { APPLICATION_STATUSES, EDUCATION_LEVELS, EXPERIENCE_FILTERS } from '@/constants';

// /employer/jobs/:jobId/applicants shows one job; /employer/applicants shows every job.
export default function ApplicantsPage() {
  const { jobId } = useParams();
  useDocumentTitle('Applicants');
  const fetcher = (params) => (jobId ? applicationService.forJob(jobId, params) : applicationService.forEmployer(params));
  const table = useTableQuery(['applications', 'employer', jobId || 'all'], fetcher, { filters: { status: '', experience: '', education: '', skills: '' }, sort: { key: 'appliedAt', dir: 'desc' } });
  const job = useQuery({ queryKey: ['job', jobId], queryFn: () => jobService.getById(jobId), enabled: Boolean(jobId), select: (res) => res.data });

  const changeStatus = useActionMutation(({ id, status }) => applicationService.updateStatus(id, { status }), {
    success: 'Status updated. The candidate has been notified.', invalidate: [['applications'], ['employer-dashboard']],
  });

  return (
    <div className="max-w-5xl">
      <PageHeader title={job.data ? `Applicants for ${job.data.title}` : 'All applicants'} description="Review candidates and move them through your hiring process." actions={jobId && <Button as={Link} to="/employer/applicants" variant="outline">All jobs</Button>} />

      <div className="card mb-5 grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-5">
        <Input aria-label="Search applicants" leftIcon={Search} placeholder="Search by name" value={table.search} onChange={(event) => table.setSearch(event.target.value)} />
        <Select aria-label="Status" placeholder="All statuses" options={APPLICATION_STATUSES} value={table.filters.status} onChange={(event) => table.setFilter('status', event.target.value)} />
        <Select aria-label="Experience" placeholder="Any experience" options={EXPERIENCE_FILTERS} value={table.filters.experience} onChange={(event) => table.setFilter('experience', event.target.value)} />
        <Select aria-label="Education" placeholder="Any education" options={EDUCATION_LEVELS} value={table.filters.education} onChange={(event) => table.setFilter('education', event.target.value)} />
        <Input aria-label="Skills" placeholder="Skill, e.g. React" value={table.filters.skills} onChange={(event) => table.setFilter('skills', event.target.value)} />
      </div>

      {table.isError ? <ErrorState onRetry={table.refetch} /> : table.isLoading ? <div className="space-y-3"><Skeleton className="h-36" /><Skeleton className="h-36" /></div> : table.rows.length === 0 ? (
        <EmptyState icon={Users} title="No applicants found" description="When candidates apply, or when your filters match someone, they appear here." />
      ) : (
        <div className="space-y-3">
          {table.rows.map((application) => <ApplicantCard key={application._id} application={application} busy={changeStatus.isPending} onStatusChange={(id, status) => changeStatus.mutate({ id, status })} />)}
        </div>
      )}
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
