import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import useAuth from '@/hooks/useAuth';
import { savedJobService } from '@/services/savedJobService';
import { toast } from '@/utils/toast';
import { cn } from '@/utils/cn';

export default function SaveJobButton({ job, withLabel = false, className }) {
  const { isLoggedIn, isSeeker } = useAuth();
  const [saved, setSaved] = useState(Boolean(job.isSaved));
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const toggle = async () => {
    if (!isLoggedIn) return navigate('/login', { state: { from: location } });
    if (!isSeeker) return toast.info('Only job seeker accounts can save jobs.');
    setBusy(true);
    const wasSaved = saved;
    setSaved(!wasSaved); // update instantly, roll back if the API fails
    try {
      if (wasSaved) await savedJobService.remove(job._id);
      else await savedJobService.save(job._id);
      toast.success(wasSaved ? 'Removed from saved jobs.' : 'Job saved.');
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['seeker-dashboard'] });
    } catch (error) {
      setSaved(wasSaved);
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
    return undefined;
  };

  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
      className={cn('inline-flex items-center gap-2 rounded-lg p-2 text-sm font-medium transition hover:bg-brand-50 disabled:opacity-60', saved ? 'text-brand-600' : 'text-slate-500', withLabel && 'border border-slate-300 px-4', className)}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {withLabel && (saved ? 'Saved' : 'Save Job')}
    </button>
  );
}
