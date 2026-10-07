import { forwardRef, useId } from 'react';
import Field from './Field';
import { cn } from '@/utils/cn';

// options: [{ value, label }]
const Select = forwardRef(function Select({ label, error, hint, required, options = [], placeholder, className, wrapperClassName, id, ...props }, ref) {
  const autoId = useId();
  const selectId = id || autoId;
  return (
    <Field label={label} htmlFor={selectId} error={error} hint={hint} required={required} className={cn('min-w-0 max-w-full', wrapperClassName)}>
      <select ref={ref} id={selectId} aria-invalid={Boolean(error) || undefined} className={cn('control w-full min-w-0 max-w-full', error && 'control-error', className)} {...props}>
        {placeholder !== undefined && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </Field>
  );
});

export default Select;
