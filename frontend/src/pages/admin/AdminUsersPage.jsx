import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import Select from '@/components/ui/Select';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { adminService } from '@/services/adminService';
import { USER_ROLE_OPTIONS } from '@/constants';
import { formatDate, labelFor } from '@/utils/format';

// Also mounted at /admin/job-seekers with role="JOB_SEEKER" (role filter is then fixed).
export default function AdminUsersPage({ role }) {
  const title = role ? 'Job seekers' : 'Users';
  useDocumentTitle(title);
  const table = useTableQuery(['admin', 'users', role || 'all'], adminService.users, { filters: { role: role || '', isActive: '' } });
  const [pending, setPending] = useState(null); // { type: 'toggle' | 'delete' | 'role' | 'view', user }
  const [newRole, setNewRole] = useState('');
  const refresh = { invalidate: [['admin', 'users'], ['admin', 'dashboard']] };
  const close = () => setPending(null);

  const toggle = useActionMutation((user) => adminService.updateUser(user._id, { isActive: !user.isActive }), { success: 'Account updated.', ...refresh, onSuccess: close });
  const changeRole = useActionMutation(() => adminService.updateUser(pending.user._id, { role: newRole }), { success: 'Role changed.', ...refresh, onSuccess: close });
  const remove = useActionMutation((user) => adminService.deleteUser(user._id), { success: 'User deleted.', ...refresh, onSuccess: close });

  const columns = [
    { key: 'name', header: 'User', sortable: true, render: (user) => <div className="flex items-center gap-3"><Avatar src={user.profileImage} name={user.name} size="sm" /><div className="min-w-0 text-left"><p className="truncate font-medium">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div></div> },
    { key: 'role', header: 'Role', render: (user) => <Badge tone={user.role === 'ADMIN' ? 'purple' : 'blue'}>{labelFor(USER_ROLE_OPTIONS, user.role)}</Badge> },
    { key: 'isActive', header: 'Status', render: (user) => <Badge tone={user.isActive ? 'green' : 'red'}>{user.isActive ? 'Active' : 'Deactivated'}</Badge> },
    { key: 'createdAt', header: 'Joined', sortable: true, render: (user) => formatDate(user.createdAt) },
    { key: 'actions', header: 'Actions', render: (user) => (
      <div className="flex flex-wrap justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'view', user })}>View</Button>
        <Button variant="ghost" size="sm" onClick={() => setPending({ type: 'toggle', user })}>{user.isActive ? 'Deactivate' : 'Activate'}</Button>
        <Button variant="ghost" size="sm" onClick={() => { setNewRole(user.role); setPending({ type: 'role', user }); }}>Change role</Button>
        <Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setPending({ type: 'delete', user })}>Delete</Button>
      </div>
    ) },
  ];

  const filters = [
    ...(role ? [] : [{ key: 'role', label: 'All roles', options: USER_ROLE_OPTIONS }]),
    { key: 'isActive', label: 'Any status', options: [{ value: 'true', label: 'Active' }, { value: 'false', label: 'Deactivated' }] },
  ];
  const user = pending?.user;

  return (
    <div>
      <PageHeader title={title} description="Search, activate or deactivate accounts and manage roles." />
      <TableToolbar table={table} placeholder="Search by name or email" filters={filters} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No users match" emptyDescription="Try a different search or filter." />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />

      <Modal open={pending?.type === 'view'} onClose={close} title="User profile" size="sm">
        {user && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3"><Avatar src={user.profileImage} name={user.name} size="lg" /><div><p className="font-semibold">{user.name}</p><p className="text-slate-500">{user.email}</p></div></div>
            <dl className="grid grid-cols-2 gap-3">
              <div><dt className="text-slate-500">Role</dt><dd>{labelFor(USER_ROLE_OPTIONS, user.role)}</dd></div>
              <div><dt className="text-slate-500">Phone</dt><dd>{user.phone || '-'}</dd></div>
              <div><dt className="text-slate-500">Location</dt><dd>{user.location || '-'}</dd></div>
              <div><dt className="text-slate-500">Joined</dt><dd>{formatDate(user.createdAt)}</dd></div>
            </dl>
            {user.headline && <p className="text-slate-700">{user.headline}</p>}
          </div>
        )}
      </Modal>
      <ConfirmDialog open={pending?.type === 'toggle'} title={user?.isActive ? 'Deactivate account?' : 'Activate account?'} message={user?.isActive ? `${user?.name} will no longer be able to log in.` : `${user?.name} will be able to log in again.`} confirmLabel={user?.isActive ? 'Deactivate' : 'Activate'} danger={user?.isActive} loading={toggle.isPending} onConfirm={() => toggle.mutate(user)} onCancel={close} />
      <ConfirmDialog open={pending?.type === 'delete'} title="Delete this user?" message={`${user?.name} and their data will be permanently removed. This cannot be undone.`} confirmLabel="Delete user" danger loading={remove.isPending} onConfirm={() => remove.mutate(user)} onCancel={close} />
      <Modal open={pending?.type === 'role'} onClose={close} title="Change role" size="sm" footer={<><Button variant="outline" onClick={close}>Cancel</Button><Button onClick={() => changeRole.mutate()} loading={changeRole.isPending} disabled={newRole === user?.role}>Change role</Button></>}>
        <p className="mb-3 text-sm text-slate-600">Changing the role of <strong>{user?.name}</strong> changes what they can access immediately.</p>
        <Select label="New role" options={USER_ROLE_OPTIONS} value={newRole} onChange={(event) => setNewRole(event.target.value)} />
      </Modal>
    </div>
  );
}
