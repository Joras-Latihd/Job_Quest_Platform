import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { jobService } from '@/services/jobService';
import { cn } from '@/utils/cn';
import { formatDate } from '@/utils/format';

const TABS = [
  { key: 'featured', label: 'Featured now', filters: { status: 'PUBLISHED', featured: 'true' } },
  { key: 'requested', label: 'Feature requests', filters: { status: 'PUBLISHED', featureRequested: 'true', featured: 'false' } },
];

export default function AdminFeaturedJobsPage() {
  useDocumentTitle('Featured jobs');
  const [tab, setTab] = useState('featured');
  const table = useTableQuery(['admin', 'featured', tab], adminService.jobs, { filters: TABS.find((item) => item.key === tab).filters });
  const feature = useActionMutation((job) => jobService.feature(job._id, { isFeatured: !job.isFeatured }), { success: 'Featured status updated.', invalidate: [['admin', 'featured'], ['admin', 'jobs']] });

  const columns = [
    { key: 'title', header: 'Job', render: (job) => <div className="text-left"><p className="font-medium">{job.title}</p><p className="text-xs text-slate-500">{job.company?.name}</p></div> },
    { key: 'status', header: 'Featured', render: (job) => (job.isFeatured ? <Badge tone="amber">Featured</Badge> : <Badge>Requested</Badge>) },
    { key: 'deadline', header: 'Deadline', render: (job) => formatDate(job.deadline) },
    { key: 'actions', header: 'Actions', render: (job) => (
      <div className="flex justify-end gap-1">
        <Button as={Link} to={`/jobs/${job._id}`} variant="ghost" size="sm">View</Button>
        <Button size="sm" variant={job.isFeatured ? 'outline' : 'primary'} onClick={() => feature.mutate(job)}>{job.isFeatured ? 'Unfeature' : 'Feature'}</Button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Featured jobs" description="Featured jobs appear first on the homepage. Employers can request placement; you decide." />
      <div role="tablist" className="mb-4 inline-flex gap-1 rounded-xl bg-slate-100 p-1">
        {TABS.map((item) => <button key={item.key} role="tab" aria-selected={tab === item.key} onClick={() => setTab(item.key)} className={cn('rounded-lg px-4 py-1.5 text-sm font-medium', tab === item.key ? 'bg-white shadow-sm' : 'text-slate-600')}>{item.label}</button>)}
      </div>
      <TableToolbar table={table} placeholder="Search jobs" />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} emptyTitle={tab === 'featured' ? 'No featured jobs' : 'No feature requests'} />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
