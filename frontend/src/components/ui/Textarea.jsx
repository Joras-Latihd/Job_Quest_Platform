import { forwardRef, useId } from 'react';
import Field from './Field';
import { cn } from '@/utils/cn';

const Textarea = forwardRef(function Textarea({ label, error, hint, required, rows = 4, className, wrapperClassName, id, ...props }, ref) {
  const autoId = useId();
  const textareaId = id || autoId;
  return (
    <Field label={label} htmlFor={textareaId} error={error} hint={hint} required={required} className={wrapperClassName}>
      <textarea ref={ref} id={textareaId} rows={rows} aria-invalid={Boolean(error) || undefined} className={cn('control', error && 'control-error', className)} {...props} />
    </Field>
  );
});

export default Textarea;
