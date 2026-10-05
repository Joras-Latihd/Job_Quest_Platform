import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

const variants = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  accent: 'bg-accent-400 text-slate-900 hover:bg-accent-500',
};
const sizes = { sm: 'h-8 px-3 text-sm', md: 'h-10 px-4 text-sm', lg: 'h-12 px-6 text-base' };

// Renders a <button> by default; pass as={Link} (with `to`) or as="a" (with `href`) for navigation.
export default function Button({ as: Component = 'button', variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props }) {
  const buttonProps = Component === 'button' ? { type: 'button', disabled: disabled || loading } : {};
  return (
    <Component
      {...buttonProps}
      {...props}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant], sizes[size], className,
      )}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {children}
    </Component>
  );
}
