import { useCallback, useRef, useState } from 'react';
import { Share2, Link2 } from 'lucide-react';
import useClickOutside from '@/hooks/useClickOutside';
import { buildShareLinks } from '@/utils/share';
import { toast } from '@/utils/toast';

export default function ShareMenu({ title, url = window.location.href }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useClickOutside(ref, close);

  const handleShare = async () => {
    if (navigator.share) { // native share sheet on supported phones
      try { await navigator.share({ title, url }); } catch { /* user cancelled */ }
      return;
    }
    setOpen((value) => !value);
  };

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); toast.success('Link copied.'); } catch { toast.error('Could not copy the link.'); }
    close();
  };

  return (
    <div className="relative" ref={ref}>
      <button type="button" onClick={handleShare} aria-haspopup="menu" aria-expanded={open} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
        <Share2 className="h-4 w-4" aria-hidden="true" /> Share
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-30 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <button type="button" role="menuitem" onClick={copyLink} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-slate-50"><Link2 className="h-4 w-4" aria-hidden="true" /> Copy link</button>
          {buildShareLinks(url, title).map((item) => (
            <a key={item.label} role="menuitem" href={item.href} target="_blank" rel="noreferrer noopener" className="block rounded-lg px-3 py-2 text-sm hover:bg-slate-50">{item.label}</a>
          ))}
        </div>
      )}
    </div>
  );
}
