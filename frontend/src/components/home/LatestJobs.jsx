import { useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import JobList from '@/components/jobs/JobList';
import Pagination from '@/components/ui/Pagination';
import Button from '@/components/ui/Button';
import { jobService } from '@/services/jobService';
import { SORT_OPTIONS } from '@/constants';

export default function LatestJobs() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('newest');
  const query = useQuery({ queryKey: ['jobs', 'latest', page, sort], queryFn: () => jobService.list({ page, limit: 6, sort }), placeholderData: keepPreviousData });

  return (
    <section className="container-page py-14" aria-labelledby="latest-title">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="latest-title" className="section-title">Latest jobs</h2>
          <p className="mt-1 text-slate-500">Freshly published openings.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Sort by
          <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} className="control !w-auto">
            {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <JobList query={query} skeletonCount={3} emptyTitle="No jobs published yet" emptyDescription="New openings will show up here as soon as employers post them." />
      <Pagination pagination={query.data?.pagination} onPageChange={setPage} />
      <div className="mt-8 text-center"><Button as={Link} to="/find-jobs" variant="outline">Search all jobs</Button></div>
    </section>
  );
}
