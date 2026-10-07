export default function Field({ label, htmlFor, error, hint, required, children, className }) {
  return (
    <div className={cn('min-w-0 max-w-full', className)}>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-0.5 text-red-500" aria-hidden="true">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
