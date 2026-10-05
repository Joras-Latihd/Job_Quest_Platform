import { forwardRef, useId } from 'react';

const Checkbox = forwardRef(function Checkbox({ label, error, id, ...props }, ref) {
  const autoId = useId();
  const checkboxId = id || autoId;
  return (
    <div>
      <label htmlFor={checkboxId} className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input ref={ref} id={checkboxId} type="checkbox" className="h-4 w-4 rounded border-slate-300 text-brand-600" {...props} />
        {label}
      </label>
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default Checkbox;
