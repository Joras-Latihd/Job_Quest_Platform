import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { INDUSTRIES, VERIFICATION_STATUSES } from '@/constants';
import { formatDate, formatLocation } from '@/utils/format';

export default function AdminCompaniesPage() {
  useDocumentTitle('Companies');
  const table = useTableQuery(['admin', 'companies'], adminService.companies, { filters: { verificationStatus: '', industry: '' } });
  const columns = [
    { key: 'name', header: 'Company', sortable: true, render: (c) => <div className="flex items-center gap-3"><Avatar src={c.logo} name={c.name} size="sm" square /><span className="text-left font-medium">{c.name}</span></div> },
    { key: 'industry', header: 'Industry' },
    { key: 'location', header: 'Location', render: (c) => formatLocation(c.location) },
    { key: 'verificationStatus', header: 'Status', render: (c) => <StatusBadge status={c.verificationStatus} options={VERIFICATION_STATUSES} /> },
    { key: 'activeJobs', header: 'Active jobs', render: (c) => c.activeJobs ?? 0 },
    { key: 'createdAt', header: 'Created', sortable: true, render: (c) => formatDate(c.createdAt) },
    { key: 'actions', header: 'Actions', render: (c) => <Button as={Link} to={`/companies/${c._id}`} variant="ghost" size="sm">View page</Button> },
  ];
  return (
    <div>
      <PageHeader title="Companies" description="All company profiles. Verification is handled on the Employers page." actions={<Button as={Link} to="/admin/employers" variant="outline">Go to employers</Button>} />
      <TableToolbar table={table} placeholder="Search companies" filters={[{ key: 'verificationStatus', label: 'All statuses', options: VERIFICATION_STATUSES }, { key: 'industry', label: 'All industries', options: INDUSTRIES }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No companies found" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
    </div>
  );
}
