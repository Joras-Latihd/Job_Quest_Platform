import Badge from './Badge';
import { getStatus } from '@/utils/format';

// options: one of APPLICATION_STATUSES, JOB_STATUSES, VERIFICATION_STATUSES, REPORT_STATUSES
export default function StatusBadge({ status, options }) {
  const { label, tone } = getStatus(options, status);
  return <Badge tone={tone}>{label}</Badge>;
}
