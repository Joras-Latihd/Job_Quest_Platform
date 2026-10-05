import { forwardRef, useId } from 'react';
import Field from './Field';
import { cn } from '@/utils/cn';

const Input = forwardRef(function Input({ label, error, hint, required, leftIcon: LeftIcon, className, wrapperClassName, id, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  return (
    <Field label={label} htmlFor={inputId} error={error} hint={hint} required={required} className={wrapperClassName}>
      <div className="relative">
        {LeftIcon && <LeftIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error) || undefined}
          className={cn('control', LeftIcon && 'pl-9', error && 'control-error', className)}
          {...props}
        />
      </div>
    </Field>
  );
});

export default Input;
