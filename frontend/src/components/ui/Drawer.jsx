import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

// Slide-in panel used for mobile filters and the dashboard sidebar.
export default function Drawer({ open, onClose, title, side = 'left', children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] overflow-hidden" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        className={`absolute inset-y-0 flex w-[min(92vw,24rem)] flex-col bg-white shadow-2xl ${side === 'left' ? 'left-0' : 'right-0'} ${className}`}
        style={{ maxHeight: '100dvh' }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close panel" className="ml-3 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
