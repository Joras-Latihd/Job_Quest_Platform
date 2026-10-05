import DashboardShell from './DashboardShell';
import { ADMIN_NAV } from '@/constants/navigation';

export default function AdminLayout() {
  return <DashboardShell nav={ADMIN_NAV} label="Admin Panel" variant="dark" />;
}
