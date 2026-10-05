import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import JobCard from '@/components/jobs/JobCard';
import JobCardSkeleton from '@/components/jobs/JobCardSkeleton';
import { jobService } from '@/services/jobService';

export default function FeaturedJobs() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['jobs', 'featured'], queryFn: () => jobService.list({ featured: true, limit: 6, sort: 'newest' }) });
  const jobs = data?.data || [];
  if (isError || (!isLoading && jobs.length === 0)) return null;
  return (
    <section className="bg-white py-14" aria-labelledby="featured-title">
      <div className="container-page">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-title" className="section-title">Featured jobs</h2>
            <p className="mt-1 text-slate-500">Hand-picked openings from verified employers.</p>
          </div>
          <Link to="/find-jobs?featured=true" className="text-sm font-medium text-brand-600 hover:underline">See all featured</Link>
        </div>
        {isLoading ? <JobCardSkeleton count={4} /> : <div className="grid gap-4 lg:grid-cols-2">{jobs.map((job) => <JobCard key={job._id} job={job} />)}</div>}
      </div>
    </section>
  );
}
