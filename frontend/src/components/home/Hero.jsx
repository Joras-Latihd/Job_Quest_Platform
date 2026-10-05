import { Link } from 'react-router-dom';
import SearchBar from '@/components/common/SearchBar';
import { usePopularSearches } from '@/hooks/useMeta';

export default function Hero() {
  const popularSearches = usePopularSearches();
  return (
    <section className="relative overflow-hidden bg-brand-700 text-white">
      {/* Ridge line: the climb toward the next opportunity */}
      <svg className="pointer-events-none absolute inset-x-0 bottom-0 w-full text-brand-800" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
        <path fill="currentColor" d="M0 220V150l160-80 140 60 200-110 180 120 160-70 220 110 180-90 200 80v50z" />
      </svg>
      <div className="container-page relative pb-24 pt-14 sm:pt-20">
        <p className="mb-3 inline-block rounded-full bg-white/10 px-3 py-1 text-sm text-brand-100">Jobs across Kathmandu, Pokhara, Biratnagar and remote</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight !text-white sm:text-5xl">Find your next opportunity</h1>
        <p className="mt-4 max-w-xl text-lg text-brand-100">Discover jobs that match your skills, experience and career goals.</p>
        <SearchBar className="mt-8 max-w-4xl" />
        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-brand-200">Popular searches:</span>
          {popularSearches.map((term) => (
            <Link key={term} to={`/find-jobs?keyword=${encodeURIComponent(term)}`} className="rounded-full border border-white/25 px-3 py-1 text-white transition hover:bg-white/15">{term}</Link>
          ))}
        </div>
      </div>
    </section>
  );
}
