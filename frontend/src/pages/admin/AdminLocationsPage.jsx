import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { metaService } from '@/services/metaService';
import { locationSchema } from '@/schemas/miscSchemas';

const EMPTY = { city: '', district: '', province: '', country: 'Nepal', status: 'active' };
const STATUS_OPTIONS = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
const refreshKeys = [['admin', 'locations'], ['locations']];

function LocationForm({ location, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(locationSchema), defaultValues: location._id ? { ...EMPTY, ...location } : EMPTY });
  const save = useActionMutation((values) => (location._id ? metaService.updateLocation(location._id, values) : metaService.createLocation(values)), { success: 'Location saved.', invalidate: refreshKeys, onSuccess: onClose });
  return (
    <Modal open onClose={onClose} title={location._id ? 'Edit location' : 'New location'} size="sm" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="location-form" loading={save.isPending}>Save</Button></>}>
      <form id="location-form" onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-4" noValidate>
        <Input label="City" required error={errors.city?.message} {...register('city')} />
        <div className="grid gap-4 sm:grid-cols-2"><Input label="District" {...register('district')} /><Input label="Province" {...register('province')} /></div>
        <Input label="Country" required error={errors.country?.message} {...register('country')} />
        <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
      </form>
    </Modal>
  );
}

export default function AdminLocationsPage() {
  useDocumentTitle('Locations');
  const table = useTableQuery(['admin', 'locations'], metaService.locations, { filters: { status: '' }, sort: { key: 'city', dir: 'asc' } });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const toggle = useActionMutation((item) => metaService.updateLocation(item._id, { status: item.status === 'active' ? 'inactive' : 'active' }), { success: 'Location updated.', invalidate: refreshKeys });
  const remove = useActionMutation(metaService.deleteLocation, { success: 'Location deleted.', invalidate: refreshKeys, onSuccess: () => setDeleting(null) });

  const columns = [
    { key: 'city', header: 'City', sortable: true, render: (l) => <span className="font-medium">{l.city}</span> },
    { key: 'district', header: 'District' },
    { key: 'province', header: 'Province' },
    { key: 'country', header: 'Country', sortable: true },
    { key: 'status', header: 'Status', render: (l) => <Badge tone={l.status === 'active' ? 'green' : 'gray'}>{l.status === 'active' ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', render: (l) => (
      <div className="flex flex-wrap justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditing(l)}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => toggle.mutate(l)}>{l.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
        <Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setDeleting(l)}>Delete</Button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Locations" description="Cities available for jobs, companies and filters. Nepal first, other countries supported." actions={<Button onClick={() => setEditing(EMPTY)}>Add location</Button>} />
      <TableToolbar table={table} placeholder="Search locations" filters={[{ key: 'status', label: 'Any status', options: STATUS_OPTIONS }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No locations yet" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
      {editing && <LocationForm location={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} title="Delete this location?" message={`"${deleting?.city}" can only be deleted if no jobs or companies use it. Otherwise deactivate it.`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate(deleting._id)} onCancel={() => setDeleting(null)} />
    </div>
  );
}
