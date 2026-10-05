import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

const styles = {
  success: { icon: CheckCircle2, className: 'border-emerald-200 bg-emerald-50 text-emerald-800' },
  error: { icon: AlertCircle, className: 'border-red-200 bg-red-50 text-red-800' },
  info: { icon: Info, className: 'border-brand-200 bg-brand-50 text-brand-800' },
};

export default function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:px-6">
      {toasts.map((item) => {
        const { icon: Icon, className } = styles[item.type] || styles.info;
        return (
          <div key={item.id} role="status" className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg ${className}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p className="flex-1">{item.message}</p>
            <button type="button" onClick={() => dismiss(item.id)} aria-label="Dismiss notification"><X className="h-4 w-4" /></button>
          </div>
        );
      })}
    </div>
  );
}
