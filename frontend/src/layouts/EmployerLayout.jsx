import DashboardShell from './DashboardShell';
import { EMPLOYER_NAV } from '@/constants/navigation';

export default function EmployerLayout() {
  return <DashboardShell nav={EMPLOYER_NAV} label="Employer" />;
}
