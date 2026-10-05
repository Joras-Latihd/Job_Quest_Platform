import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Briefcase } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import DataTable from '@/components/ui/DataTable';
import Pagination from '@/components/ui/Pagination';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import TableToolbar from '@/components/admin/TableToolbar';
import useTableQuery from '@/hooks/useTableQuery';
import useActionMutation from '@/hooks/useActionMutation';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { metaService } from '@/services/metaService';
import { categorySchema } from '@/schemas/miscSchemas';
import { CATEGORY_ICONS, CATEGORY_ICON_OPTIONS } from '@/utils/icons';

const EMPTY = { name: '', description: '', icon: 'Briefcase', status: 'active' };
const STATUS_OPTIONS = [{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }];
const refreshKeys = [['admin', 'categories'], ['categories']];

function CategoryForm({ category, onClose }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(categorySchema), defaultValues: category._id ? { ...EMPTY, ...category } : EMPTY });
  const save = useActionMutation((values) => (category._id ? metaService.updateCategory(category._id, values) : metaService.createCategory(values)), { success: 'Category saved.', invalidate: refreshKeys, onSuccess: onClose });
  return (
    <Modal open onClose={onClose} title={category._id ? 'Edit category' : 'New category'} size="sm" footer={<><Button variant="outline" onClick={onClose}>Cancel</Button><Button type="submit" form="category-form" loading={save.isPending}>Save</Button></>}>
      <form id="category-form" onSubmit={handleSubmit((values) => save.mutate(values))} className="space-y-4" noValidate>
        <Input label="Name" required error={errors.name?.message} {...register('name')} />
        <Textarea label="Description" rows={3} {...register('description')} />
        <Select label="Icon" required options={CATEGORY_ICON_OPTIONS} error={errors.icon?.message} {...register('icon')} />
        <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
      </form>
    </Modal>
  );
}

export default function AdminCategoriesPage() {
  useDocumentTitle('Categories');
  const table = useTableQuery(['admin', 'categories'], metaService.categories, { filters: { status: '' }, sort: { key: 'name', dir: 'asc' } });
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const toggle = useActionMutation((category) => metaService.updateCategory(category._id, { status: category.status === 'active' ? 'inactive' : 'active' }), { success: 'Category updated.', invalidate: refreshKeys });
  // The API refuses to delete a category that still has jobs and explains why; the message is shown as a toast.
  const remove = useActionMutation(metaService.deleteCategory, { success: 'Category deleted.', invalidate: refreshKeys, onSuccess: () => setDeleting(null) });

  const columns = [
    { key: 'name', header: 'Category', sortable: true, render: (c) => { const Icon = CATEGORY_ICONS[c.icon] || Briefcase; return <span className="flex items-center gap-2 font-medium"><Icon className="h-4 w-4 text-brand-600" aria-hidden="true" />{c.name}</span>; } },
    { key: 'description', header: 'Description', render: (c) => <span className="line-clamp-2 max-w-xs text-left text-slate-600">{c.description || '-'}</span> },
    { key: 'activeJobs', header: 'Jobs', render: (c) => c.jobsCount ?? c.activeJobs ?? 0 },
    { key: 'status', header: 'Status', render: (c) => <Badge tone={c.status === 'active' ? 'green' : 'gray'}>{c.status === 'active' ? 'Active' : 'Inactive'}</Badge> },
    { key: 'actions', header: 'Actions', render: (c) => (
      <div className="flex flex-wrap justify-end gap-1">
        <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>Edit</Button>
        <Button variant="ghost" size="sm" onClick={() => toggle.mutate(c)}>{c.status === 'active' ? 'Deactivate' : 'Activate'}</Button>
        <Button variant="ghost" size="sm" className="!text-red-600" onClick={() => setDeleting(c)}>Delete</Button>
      </div>
    ) },
  ];

  return (
    <div>
      <PageHeader title="Categories" description="Job categories shown on the homepage and in filters." actions={<Button onClick={() => setEditing(EMPTY)}>Add category</Button>} />
      <TableToolbar table={table} placeholder="Search categories" filters={[{ key: 'status', label: 'Any status', options: STATUS_OPTIONS }]} />
      <DataTable columns={columns} rows={table.rows} isLoading={table.isLoading} isError={table.isError} onRetry={table.refetch} sort={table.sort} onSort={table.toggleSort} emptyTitle="No categories yet" />
      <Pagination pagination={table.pagination} onPageChange={table.setPage} />
      {editing && <CategoryForm category={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(deleting)} title="Delete this category?" message={`"${deleting?.name}" can only be deleted if no jobs use it. If jobs use it, deactivate it instead.`} confirmLabel="Delete" danger loading={remove.isPending} onConfirm={() => remove.mutate(deleting._id)} onCancel={() => setDeleting(null)} />
    </div>
  );
}
