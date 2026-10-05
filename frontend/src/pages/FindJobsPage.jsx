import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { SlidersHorizontal } from 'lucide-react';
import SearchBar from '@/components/common/SearchBar';
import FilterSidebar from '@/components/jobs/FilterSidebar';
import JobList from '@/components/jobs/JobList';
import Pagination from '@/components/ui/Pagination';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import useSearchFilters from '@/hooks/useSearchFilters';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { jobService } from '@/services/jobService';
import { SORT_OPTIONS } from '@/constants';

const PAGE_SIZE = 10;

export default function FindJobsPage() {
  useDocumentTitle('Find jobs');
  const { filters, setFilters, clearFilters, activeCount } = useSearchFilters();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const query = useQuery({
    queryKey: ['jobs', 'search', filters],
    queryFn: () => jobService.list({ ...filters, limit: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
  const total = query.data?.pagination?.total;

  const sidebar = <FilterSidebar filters={filters} setFilters={setFilters} clearFilters={clearFilters} activeCount={activeCount} />;

  return (
    <>
      <div className="bg-brand-700 py-8">
        <div className="container-page">
          <h1 className="mb-4 text-2xl font-bold !text-white sm:text-3xl">Find jobs</h1>
          {/* key makes the inputs reset when filters are cleared or changed from the sidebar */}
          <SearchBar key={`${filters.keyword}|${filters.location}`} initialKeyword={filters.keyword || ''} initialLocation={filters.location || ''} onSearch={setFilters} />
        </div>
      </div>

      <div className="container-page grid gap-8 py-8 lg:grid-cols-[18rem_1fr]">
        <aside className="card hidden h-fit p-5 lg:block" aria-label="Job filters">{sidebar}</aside>

        <section aria-label="Search results">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600" aria-live="polite">
              {query.isLoading ? 'Searching...' : <><strong className="text-slate-900">{new Intl.NumberFormat('en-US').format(total || 0)}</strong> {total === 1 ? 'job' : 'jobs'} found</>}
            </p>
            <div className="flex items-center gap-2">
              {activeCount > 0 && <Button variant="ghost" size="sm" onClick={clearFilters}>Clear all filters</Button>}
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setDrawerOpen(true)}><SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters{activeCount > 0 ? ` (${activeCount})` : ''}</Button>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <span className="sr-only sm:not-sr-only">Sort</span>
                <select value={filters.sort || 'newest'} onChange={(event) => setFilters({ sort: event.target.value })} className="control !w-auto">
                  {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
            </div>
          </div>

          <JobList query={query} emptyDescription="Try changing your search filters." emptyAction={activeCount > 0 && <Button variant="outline" onClick={clearFilters}>Clear all filters</Button>} />
          <Pagination pagination={query.data?.pagination} onPageChange={(page) => { setFilters({ page }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />
        </section>
      </div>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Filters">
        {sidebar}
        <Button className="mt-6 w-full" onClick={() => setDrawerOpen(false)}>Show {total ?? ''} results</Button>
      </Drawer>
    </>
  );
}
