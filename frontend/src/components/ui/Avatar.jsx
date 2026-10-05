import { cn } from '@/utils/cn';

const sizes = { sm: 'h-8 w-8 text-xs', md: 'h-10 w-10 text-sm', lg: 'h-14 w-14 text-base', xl: 'h-24 w-24 text-2xl' };

export default function Avatar({ src, name = '', size = 'md', square = false, className }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || '?';
  const shape = square ? 'rounded-xl' : 'rounded-full';
  if (src) {
    return <img src={src} alt={name ? `${name} logo or photo` : ''} loading="lazy" className={cn('shrink-0 border border-slate-200 bg-white object-cover', sizes[size], shape, className)} />;
  }
  return (
    <span aria-hidden="true" className={cn('inline-flex shrink-0 items-center justify-center bg-brand-100 font-semibold text-brand-700', sizes[size], shape, className)}>
      {initials}
    </span>
  );
}
