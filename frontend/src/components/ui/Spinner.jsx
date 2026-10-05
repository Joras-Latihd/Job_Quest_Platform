import { Loader2 } from 'lucide-react';

export default function Spinner({ className = 'h-5 w-5' }) {
  return <Loader2 className={`animate-spin text-brand-600 ${className}`} aria-hidden="true" />;
}

export function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
