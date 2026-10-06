export default function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-7 flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white/80 p-5 shadow-card backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between sm:p-6">
      <div className="relative">
        <div className="absolute -left-3 top-1 h-8 w-1 rounded-full bg-gradient-to-b from-brand-400 to-brand-600" aria-hidden="true" />
        <h1 className="pl-2 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="mt-2 pl-2 text-sm leading-6 text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
