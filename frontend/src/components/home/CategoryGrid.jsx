import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import Skeleton from '@/components/ui/Skeleton';
import { useCategories } from '@/hooks/useMeta';
import { CATEGORY_ICONS } from '@/utils/icons';

export default function CategoryGrid() {
  const { data: categories, isLoading } = useCategories();
  return (
    <section className="container-page py-14" aria-labelledby="categories-title">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <h2 id="categories-title" className="section-title">Browse by category</h2>
          <p className="mt-1 text-slate-500">Pick a field and see who is hiring.</p>
        </div>
        <Link to="/find-jobs" className="hidden text-sm font-medium text-brand-600 hover:underline sm:block">View all jobs</Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {isLoading ? Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-24" />) : categories?.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon] || Briefcase;
          return (
            <Link key={category._id} to={`/find-jobs?category=${category.slug}`} className="card flex items-center gap-3 p-4 transition hover:border-brand-300 hover:shadow-lift">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" aria-hidden="true" /></span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900">{category.name}</span>
                <span className="text-xs text-slate-500">{category.activeJobs ?? 0} active jobs</span>
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
