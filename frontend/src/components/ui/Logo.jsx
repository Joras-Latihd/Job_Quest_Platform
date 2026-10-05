import { cn } from '@/utils/cn';

// Original Job Quest mark: a ridge line (the climb) with a marigold sun (the goal).
export function LogoMark({ className = 'h-9 w-9' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Job Quest logo">
      <rect width="64" height="64" rx="16" fill="#2748d6" />
      <path d="M12 47 27 22l8 12 6-8 11 21z" fill="#ffffff" />
      <path d="M27 22l5 8-5 4-4-6z" fill="#bdd0ff" />
      <circle cx="46" cy="17" r="5" fill="#fbb83c" />
    </svg>
  );
}

export default function Logo({ light = false, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className={cn('font-display text-xl font-bold tracking-tight', light ? 'text-white' : 'text-slate-900')}>
        Job<span className={light ? 'text-accent-400' : 'text-brand-600'}> Quest</span>
      </span>
    </span>
  );
}
