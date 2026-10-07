import { Link } from 'react-router-dom';
import SearchBar from '@/components/common/SearchBar';
import { usePopularSearches } from '@/hooks/useMeta';

export default function Hero() {
  const popularSearches = usePopularSearches();
  return (
    <section className="relative isolate overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_25%),linear-gradient(135deg,#1d3189_0%,#2748d6_45%,#1b2b6b_100%)] text-white">
      <div className="absolute inset-0 -z-10 opacity-80">
        <div className="absolute -left-24 top-12 h-72 w-72 rounded-full bg-accent-400/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 top-0 h-96 w-96 rounded-full bg-brand-300/10 blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-white/5 blur-3xl" aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:34px_34px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" aria-hidden="true" />
      </div>

      <div className="container-page relative pb-20 pt-10 sm:pt-16 lg:pb-28">
        <div className="mx-auto max-w-4xl text-center lg:mx-0 lg:text-left">
          <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-brand-50 shadow-lg shadow-brand-950/20 backdrop-blur-sm sm:text-sm">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent-400 shadow-[0_0_12px_rgba(251,184,60,0.8)]" aria-hidden="true" />
            <span className="truncate">Jobs across Kathmandu, Pokhara, Biratnagar and remote</span>
          </span>
          <h1 className="mt-6 max-w-4xl text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Find your next <span className="text-accent-400">opportunity</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-brand-100 sm:text-lg lg:mx-0">
            Discover jobs that match your skills, experience and career goals.
          </p>
        </div>

        <SearchBar className="relative mt-9 max-w-5xl shadow-[0_25px_60px_-25px_rgba(15,23,42,0.7)]" />

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm lg:justify-start">
          <span className="font-medium text-brand-200">Popular searches:</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              to={`/find-jobs?keyword=${encodeURIComponent(term)}`}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-200 hover:bg-white/10 hover:shadow-md"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
