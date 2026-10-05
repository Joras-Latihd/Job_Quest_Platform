import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import { useCategories, useLocations } from '@/hooks/useMeta';
import { DATE_POSTED_OPTIONS, EDUCATION_LEVELS, EXPERIENCE_FILTERS, JOB_TYPES, WORKPLACE_TYPES } from '@/constants';

function RadioGroup({ title, name, options, value, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate-900">{title}</legend>
      <div className="space-y-1.5">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
            <input type="radio" name={name} checked={value === option.value} onChange={() => onChange(option.value)} className="h-4 w-4 border-slate-300 text-brand-600" />
            {option.label}
          </label>
        ))}
        {value && <button type="button" onClick={() => onChange('')} className="text-xs font-medium text-brand-600 hover:underline">Clear {title.toLowerCase()}</button>}
      </div>
    </fieldset>
  );
}

export default function FilterSidebar({ filters, setFilters, clearFilters, activeCount }) {
  const { data: categories = [] } = useCategories();
  const { data: locations = [] } = useLocations();
  // Salary fields apply when the user leaves the field, not on every keystroke.
  const [salary, setSalary] = useState({ minSalary: filters.minSalary || '', maxSalary: filters.maxSalary || '' });
  useEffect(() => { setSalary({ minSalary: filters.minSalary || '', maxSalary: filters.maxSalary || '' }); }, [filters.minSalary, filters.maxSalary]);

  const applySalary = () => setFilters(salary);
  const locationOptions = [{ value: 'Remote', label: 'Remote' }, ...locations.map((item) => ({ value: item.city, label: item.city }))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Filters</h2>
        {activeCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all ({activeCount})</Button>}
      </div>

      <Select label="Location" placeholder="Any location" options={locationOptions} value={filters.location || ''} onChange={(event) => setFilters({ location: event.target.value })} />
      <Select label="Category" placeholder="All categories" options={categories.map((item) => ({ value: item.slug, label: item.name }))} value={filters.category || ''} onChange={(event) => setFilters({ category: event.target.value })} />

      <RadioGroup title="Job type" name="type" options={JOB_TYPES} value={filters.type || ''} onChange={(value) => setFilters({ type: value })} />
      <RadioGroup title="Experience" name="experience" options={EXPERIENCE_FILTERS} value={filters.experience || ''} onChange={(value) => setFilters({ experience: value })} />

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-slate-900">Salary (NPR per month)</legend>
        <div className="flex items-center gap-2">
          <input type="number" min="0" aria-label="Minimum salary" placeholder="Min" value={salary.minSalary} onChange={(event) => setSalary({ ...salary, minSalary: event.target.value })} onBlur={applySalary} onKeyDown={(event) => event.key === 'Enter' && applySalary()} className="control" />
          <span className="text-slate-400">-</span>
          <input type="number" min="0" aria-label="Maximum salary" placeholder="Max" value={salary.maxSalary} onChange={(event) => setSalary({ ...salary, maxSalary: event.target.value })} onBlur={applySalary} onKeyDown={(event) => event.key === 'Enter' && applySalary()} className="control" />
        </div>
      </fieldset>

      <RadioGroup title="Education" name="education" options={EDUCATION_LEVELS} value={filters.education || ''} onChange={(value) => setFilters({ education: value })} />
      <RadioGroup title="Workplace" name="workplace" options={WORKPLACE_TYPES} value={filters.workplace || ''} onChange={(value) => setFilters({ workplace: value })} />
      <RadioGroup title="Date posted" name="datePosted" options={DATE_POSTED_OPTIONS} value={filters.datePosted || ''} onChange={(value) => setFilters({ datePosted: value })} />

      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-semibold text-slate-900">More</legend>
        <Checkbox label="Urgent hiring" checked={Boolean(filters.urgent)} onChange={(event) => setFilters({ urgent: event.target.checked })} />
        <Checkbox label="Featured jobs" checked={Boolean(filters.featured)} onChange={(event) => setFilters({ featured: event.target.checked })} />
        <Checkbox label="Verified employers" checked={Boolean(filters.verified)} onChange={(event) => setFilters({ verified: event.target.checked })} />
      </fieldset>
    </div>
  );
}
