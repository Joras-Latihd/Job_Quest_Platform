import { Search } from 'lucide-react';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';

// Search box + any number of select filters, wired to the object returned by useTableQuery.
// filters: [{ key, label, options }]
export default function TableToolbar({ table, placeholder = 'Search', filters = [] }) {
  return (
    <div className="mb-4 flex min-w-0 flex-col flex-wrap gap-3 sm:flex-row">
      <Input aria-label={placeholder} leftIcon={Search} placeholder={placeholder} wrapperClassName="w-full min-w-0 flex-1" value={table.search} onChange={(event) => table.setSearch(event.target.value)} />
      {filters.map((filter) => (
        <Select key={filter.key} aria-label={filter.label} placeholder={filter.label} options={filter.options} value={table.filters[filter.key] ?? ''} onChange={(event) => table.setFilter(filter.key, event.target.value)} wrapperClassName="w-full min-w-0 sm:w-48" />
      ))}
    </div>
  );
}
