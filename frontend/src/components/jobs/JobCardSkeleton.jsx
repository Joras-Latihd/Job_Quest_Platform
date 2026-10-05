import Skeleton from '@/components/ui/Skeleton';

export default function JobCardSkeleton({ count = 4 }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading jobs">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-5">
          <div className="flex gap-4"><Skeleton className="h-14 w-14" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/3" /></div></div>
          <div className="mt-5 grid grid-cols-2 gap-3"><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /></div>
        </div>
      ))}
    </div>
  );
}
