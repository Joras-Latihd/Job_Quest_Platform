import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

/*
 * One reusable block for lists inside a react-hook-form form (education, experience, languages...).
 * fields: [{ name, label, type?: 'text'|'date'|'textarea'|'select', options?, required?, full? }]
 */
export default function RepeatableSection({ control, register, errors, name, title, fields, blank, addLabel }) {
  const { fields: items, append, remove } = useFieldArray({ control, name });
  return (
    <section className="card p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-sans text-base font-semibold">{title}</h2>
        <Button variant="outline" size="sm" onClick={() => append(blank)}><Plus className="h-4 w-4" aria-hidden="true" /> {addLabel}</Button>
      </div>
      {items.length === 0 && <p className="text-sm text-slate-500">Nothing added yet.</p>}
      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.id} className="rounded-xl border border-slate-200 p-3 sm:p-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {fields.map((field) => {
                const path = `${name}.${index}.${field.name}`;
                const error = errors[name]?.[index]?.[field.name]?.message;
                const common = { label: field.label, required: field.required, error, ...register(path) };
                const wrapperClassName = field.full ? 'sm:col-span-2' : undefined;
                if (field.type === 'textarea') return <Textarea key={field.name} rows={3} wrapperClassName={wrapperClassName} {...common} />;
                if (field.type === 'select') return <Select key={field.name} options={field.options} wrapperClassName={wrapperClassName} {...common} />;
                return <Input key={field.name} type={field.type || 'text'} wrapperClassName={wrapperClassName} {...common} />;
              })}
            </div>
            <Button variant="ghost" size="sm" className="mt-3 w-full justify-center text-red-600 sm:w-auto" onClick={() => remove(index)}><Trash2 className="h-4 w-4" aria-hidden="true" /> Remove</Button>
          </div>
        ))}
      </div>
    </section>
  );
}
