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
    <form onSubmit={handleSubmit} role="search" aria-label="Search jobs" className={`flex flex-col gap-2 rounded-2xl bg-white p-2 shadow-lift sm:flex-row ${className}`}>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input value={keyword} onChange={(event) => setKeyword(event.target.value)} aria-label="Job title, keywords or company" placeholder="Job title, keywords or company" className="h-12 w-full rounded-xl border-0 bg-slate-50 pl-10 pr-3 text-sm placeholder:text-slate-500 focus:bg-white" />
      </div>
      <div className="relative flex-1">
        <MapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input value={location} onChange={(event) => setLocation(event.target.value)} list="location-options" aria-label="Location" placeholder="City or Remote" className="h-12 w-full rounded-xl border-0 bg-slate-50 pl-10 pr-3 text-sm placeholder:text-slate-500 focus:bg-white" />
        <datalist id="location-options">
          <option value="Remote" />
          {locations.map((item) => <option key={item._id} value={item.city} />)}
        </datalist>
      </div>
      <Button type="submit" size="lg" className="sm:px-8">Search Jobs</Button>
    </form>
  );
}
