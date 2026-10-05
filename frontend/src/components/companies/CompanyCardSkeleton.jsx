import Skeleton from '@/components/ui/Skeleton';

export default function CompanyCardSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="card p-5" aria-hidden="true">
          <div className="flex gap-4"><Skeleton className="h-14 w-14" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-4 w-1/2" /></div></div>
          <Skeleton className="mt-5 h-4 w-full" />
        </div>
      ))}
    </>
  );
}
