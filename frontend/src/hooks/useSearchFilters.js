import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const FILTER_KEYS = [
  'keyword', 'location', 'category', 'type', 'experience', 'minSalary', 'maxSalary', 'workplace',
  'education', 'datePosted', 'urgent', 'featured', 'verified', 'sort', 'page',
];

/*
 * Job search filters live in the URL (?keyword=react&location=Kathmandu&type=FULL_TIME)
 * so a refresh, the back button and shared links all keep the same results.
 */
export default function useSearchFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const entries = FILTER_KEYS.map((key) => [key, searchParams.get(key)]).filter(([, value]) => value);
    return Object.fromEntries(entries);
  }, [searchParams]);

  const setFilters = useCallback((patch) => {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      Object.entries(patch).forEach(([key, value]) => {
        if (value === '' || value == null || value === false) next.delete(key);
        else next.set(key, String(value));
      });
      if (!('page' in patch)) next.delete('page'); // any filter change goes back to page 1
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => setSearchParams({}), [setSearchParams]);
  const activeCount = Object.keys(filters).filter((key) => !['sort', 'page'].includes(key)).length;

  return { filters, setFilters, clearFilters, activeCount };
}
