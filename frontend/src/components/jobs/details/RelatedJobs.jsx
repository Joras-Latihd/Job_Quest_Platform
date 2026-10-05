import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Avatar from '@/components/ui/Avatar';
import Skeleton from '@/components/ui/Skeleton';
import { jobService } from '@/services/jobService';
import { formatLocation, formatSalary } from '@/utils/format';

export default function RelatedJobs({ jobId }) {
  const { data, isLoading } = useQuery({ queryKey: ['jobs', 'related', jobId], queryFn: () => jobService.related(jobId), select: (res) => res.data });
  if (!isLoading && !data?.length) return null;
  return (
    <section className="card p-5" aria-labelledby="related-title">
      <h2 id="related-title" className="mb-3 font-sans text-base font-semibold">Related jobs</h2>
      {isLoading ? <div className="space-y-3"><Skeleton className="h-14" /><Skeleton className="h-14" /><Skeleton className="h-14" /></div> : (
        <ul className="space-y-1">
          {data.map((job) => (
            <li key={job._id}>
              <Link to={`/jobs/${job._id}`} className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50">
                <Avatar src={job.company?.logo} name={job.company?.name} size="md" square />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{job.title}</span>
                  <span className="block truncate text-xs text-slate-500">{job.company?.name} &middot; {formatLocation(job.location)}</span>
                  <span className="block truncate text-xs text-slate-500">{formatSalary(job.salary)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
