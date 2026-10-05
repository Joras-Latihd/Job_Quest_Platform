import DashboardShell from './DashboardShell';
import { SEEKER_NAV } from '@/constants/navigation';

export default function SeekerLayout() {
  return <DashboardShell nav={SEEKER_NAV} label="Job Seeker" />;
}
