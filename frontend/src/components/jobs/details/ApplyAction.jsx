import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import useAuth from '@/hooks/useAuth';

export const isJobOpen = (job) => job.status === 'PUBLISHED' && (!job.deadline || new Date(job.deadline) > new Date());

const toExternalHref = (method, value = '') => {
  if (method === 'EMAIL') return `mailto:${value}`;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
};

/*
 * One button that always shows the right thing for the current visitor:
 * closed job, external application, logged-out, wrong role, already applied, or Apply Now.
 * Used in the header, the sidebar card and the mobile bar so they can never disagree.
 */
export default function ApplyAction({ job, onApply, size = 'lg', className = '' }) {
  const { isLoggedIn, isSeeker } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!isJobOpen(job)) return <Button size={size} className={className} disabled>Applications closed</Button>;

  if (job.applicationMethod && job.applicationMethod !== 'PLATFORM') {
    return (
      <Button as="a" size={size} className={className} href={toExternalHref(job.applicationMethod, job.applicationUrl)} target="_blank" rel="noreferrer noopener">
        {job.applicationMethod === 'EMAIL' ? 'Apply by email' : 'Apply on company site'}
      </Button>
    );
  }
  if (!isLoggedIn) return <Button size={size} className={className} onClick={() => navigate('/login', { state: { from: location } })}>Log in to apply</Button>;
  if (!isSeeker) return <Button size={size} className={className} disabled>Only job seekers can apply</Button>;
  if (job.hasApplied) {
    return (
      <Button as={Link} to="/dashboard/applications" size={size} variant="secondary" className={className}>
        <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Applied - view status
      </Button>
    );
  }
  return <Button size={size} className={className} onClick={onApply}>Apply Now</Button>;
}
