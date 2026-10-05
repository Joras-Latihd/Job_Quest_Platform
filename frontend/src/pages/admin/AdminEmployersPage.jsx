import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import StatusBadge from '@/components/ui/StatusBadge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import ReasonDialog from '@/components/ui/ReasonDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { VERIFICATION_STATUSES } from '@/constants';
import { formatDate } from '@/utils/format';

export default function AdminEmployersPage() {
  useDocumentTitle('Employers');
  const table = useTableQuery(['admin', 'employers'], adminService.employers, { filters: { status: '' } });
  const [pending, setPending] = useState(null); // { type: 'verify' | 'activate' | 'reject' | 'suspend' | 'view', employer }
  const close = () => setPending(null);
  const setStatus = useActionMutation(({ status, reason }) => adminService.setEmployerStatus(pending.employer._id, { status, reason }), {
    success: 'Employer status updated.', invalidate: [['admin', 'employers'], ['admin', 'companies'], ['admin', 'dashboard']], onSuccess: close,
  });

  const columns = [
    { key: 'name', header: 'Employer', sortable: true, render: (e) => <div className="text-left"><p className="font-medium">{e.name}</p><p className="text-xs text-slate-500">{e.email}</p></div> },
    { key: 'company', header: 'Company', render: (e) => e.company?.name || <span className="text-slate-400">No company yet</span> },
    { key: 'status', header: 'Verification', render: (e) => <StatusBadge status={e.company?.verificationStatus || 'PENDING'} options={VERIFICATION_STATUSES} /> },
    { key: 'jobsCount', header: 'Jobs', render: (e) => e.jobsCount ?? 0 },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (e) => formatDate(e.createdAt) },
    { key: 'actions', header: 'Actions', render: (e) => {
      const status = e.company?.verificationStatus || 'PENDING';
      return (
        <div className="flex flex-wrap justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'view', employer: e })}>View</Button>
          {status === 'PENDING' && <><Button variant="ghost" size="sm" onClick={() => setPending({ type: 'verify', employer: e })}>Verify</Button><Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setPending({ type: 'reject', employer: e })}>Reject</Button></>}
          {status === 'VERIFIED' && <Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setPending({ type: 'suspend', employer: e })}>Suspend</Button>}
          {['SUSPENDED', 'REJECTED'].includes(status) && <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'activate', employer: e })}>Activate</Button>}
        </div>
      );
    } },
  ];

  const employer = pending?.employer;
  return (
    <div>
      <PageHeader title="Employers" description="Verify new employers before their jobs can go public." />
      <TableToolbar table={table} placeholder="Search by name, email or company" filters={[{ key: 'status', label: 'All verification states', options: VERIFICATION_STATUSES }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No employers found" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />

      <Modal open={pending?.type === 'view'} onClose={close} title={employer?.company?.name || employer?.name} size="sm">
        {employer && (
          <div className="space-y-3 text-sm">
            <p><span className="text-slate-500">Contact:</span> {employer.name} ({employer.email})</p>
            {employer.company ? <>
              <p><span className="text-slate-500">Industry:</span> {employer.company.industry}</p>
              <p><span className="text-slate-500">Website:</span> {employer.company.website || '-'}</p>
              {employer.company.verificationNote && <p className="text-red-700">Note: {employer.company.verificationNote}</p>}
              <div className="flex gap-2 pt-2"><Button as={Link} to={`/companies/${employer.company._id}`} variant="outline" size="sm">Company page</Button><Button as={Link} to={`/admin/jobs?employer=${employer._id}`} variant="outline" size="sm">Their jobs</Button></div>
            </> : <p className="text-slate-500">This employer has not created a company profile yet.</p>}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={pending?.type === 'verify' || pending?.type === 'activate'} title={pending?.type === 'verify' ? 'Verify this employer?' : 'Activate this employer?'} message="Their company will be marked verified and their jobs can be published." confirmLabel={pending?.type === 'verify' ? 'Verify' : 'Activate'} loading={setStatus.isPending} onConfirm={() => setStatus.mutate({ status: 'VERIFIED' })} onCancel={close} />
      <ReasonDialog open={pending?.type === 'reject'} title="Reject verification" description="The employer will see this reason." confirmLabel="Reject" loading={setStatus.isPending} onConfirm={(reason) => setStatus.mutate({ status: 'REJECTED', reason })} onCancel={close} />
      <ReasonDialog open={pending?.type === 'suspend'} title="Suspend employer" description="Their jobs are hidden while suspended. The employer will see this reason." confirmLabel="Suspend" loading={setStatus.isPending} onConfirm={(reason) => setStatus.mutate({ status: 'SUSPENDED', reason })} onCancel={close} />
    </div>
  );
}
