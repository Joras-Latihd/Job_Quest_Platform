import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useLocations } from '@/hooks/useMeta';

// Hero search. When `onSearch` is given (Find Jobs page) it updates the URL filters, otherwise it navigates there.
export default function SearchBar({ initialKeyword = '', initialLocation = '', onSearch, className = '' }) {
  const [keyword, setKeyword] = useState(initialKeyword);
  const [location, setLocation] = useState(initialLocation);
  const navigate = useNavigate();
  const { data: locations = [] } = useLocations();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (onSearch) return onSearch({ keyword: keyword.trim(), location: location.trim() });
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('keyword', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    return navigate(`/find-jobs?${params.toString()}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Search jobs"
      className={`flex flex-col gap-2 rounded-3xl border border-white/20 bg-white/95 p-2.5 shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_18px_45px_-22px_rgba(15,23,42,0.8)] backdrop-blur-xl sm:flex-row ${className}`}
    >
      <div className="relative flex-1">
        <label className="sr-only" htmlFor="hero-job-search">Job title, keywords or company</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-500" aria-hidden="true" />
        <input id="hero-job-search" value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label="Job title, keywords or company" placeholder="Job title, keywords or company" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-11 pr-3 text-sm text-slate-900 shadow-inner shadow-slate-200/40 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100" />
      </div>

      <div className="relative flex-1">
        <label className="sr-only" htmlFor="hero-location-search">Location</label>
        <MapPin className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-500" aria-hidden="true" />
        <input id="hero-location-search" value={location} onChange={(event) => setLocation(event.target.value)} list="location-options" aria-label="Location" placeholder="City or Remote" className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/90 pl-11 pr-3 text-sm text-slate-900 shadow-inner shadow-slate-200/40 outline-none transition placeholder:text-slate-400 focus:border-brand-300 focus:bg-white focus:ring-4 focus:ring-brand-100" />
        <datalist id="location-options">
          <option value="Remote" />
          {locations.map((item) => <option key={item._id} value={item.city} />)}
        </datalist>
      </div>

      <Button type="submit" size="lg" className="h-14 rounded-2xl bg-brand-600 px-7 font-semibold text-white shadow-lg shadow-brand-600/25 transition hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/30 sm:px-8">
        Search Jobs
      </Button>
    </form>
  );
}
