import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

function pageNumbers(current, total) {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  return [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b);
}

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;
  const { page, pages } = pagination;
  const numbers = pageNumbers(page, pages);
  const buttonClass = 'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-sm font-medium transition disabled:opacity-40';

  return (
    <nav aria-label="Pagination" className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      <button type="button" className={cn(buttonClass, 'border-slate-300 bg-white hover:bg-slate-50')} disabled={page === 1} onClick={() => onPageChange(page - 1)} aria-label="Previous page">
        <ChevronLeft className="h-4 w-4" />
      </button>
      {numbers.map((number, index) => (
        <span key={number} className="flex items-center gap-1.5">
          {index > 0 && number - numbers[index - 1] > 1 && <span className="px-1 text-slate-400">...</span>}
          <button
            type="button"
            onClick={() => onPageChange(number)}
            aria-current={number === page ? 'page' : undefined}
            className={cn(buttonClass, number === page ? 'border-brand-600 bg-brand-600 text-white' : 'border-slate-300 bg-white hover:bg-slate-50')}
          >
            {number}
          </button>
        </span>
      ))}
      <button type="button" className={cn(buttonClass, 'border-slate-300 bg-white hover:bg-slate-50')} disabled={page === pages} onClick={() => onPageChange(page + 1)} aria-label="Next page">
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}
