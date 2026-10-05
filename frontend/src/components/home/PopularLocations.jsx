import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { useLocations } from '@/hooks/useMeta';

export default function PopularLocations() {
  const { data: locations = [] } = useLocations();
  const popular = [...locations].sort((a, b) => (b.activeJobs || 0) - (a.activeJobs || 0)).slice(0, 8);
  if (!popular.length) return null;
  return (
    <section className="bg-white py-14" aria-labelledby="locations-title">
      <div className="container-page">
        <h2 id="locations-title" className="section-title">Popular locations</h2>
        <p className="mb-8 mt-1 text-slate-500">Find work close to home, or search remote roles.</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {popular.map((location) => (
            <Link key={location._id} to={`/find-jobs?location=${encodeURIComponent(location.city)}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-brand-300 hover:bg-brand-50/40">
              <MapPin className="h-5 w-5 text-brand-600" aria-hidden="true" />
              <span><span className="block text-sm font-semibold">{location.city}</span><span className="text-xs text-slate-500">{location.activeJobs ?? 0} jobs</span></span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
