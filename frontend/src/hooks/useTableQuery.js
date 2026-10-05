import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import useDebounce from './useDebounce';

const removeEmpty = (object) => Object.fromEntries(Object.entries(object).filter(([, value]) => value !== '' && value != null));

/*
 * Server-side table state: page, search, filters and sorting all go to the API as query params.
 * Used by every admin table and by the employer "My Jobs" table.
 */
export default function useTableQuery(queryKey, fetcher, { search: initialSearch = '', filters: initialFilters = {}, sort: initialSort = { key: 'createdAt', dir: 'desc' }, limit = 10 } = {}) {
  const [page, setPage] = useState(1);
  const [search, setSearchValue] = useState(initialSearch);
  const [filters, setFilters] = useState(initialFilters);
  const [sort, setSort] = useState(initialSort);
  const debouncedSearch = useDebounce(search);

  const params = removeEmpty({
    page, limit, search: debouncedSearch,
    sort: `${sort.dir === 'desc' ? '-' : ''}${sort.key}`,
    ...filters,
  });

  const query = useQuery({ queryKey: [...queryKey, params], queryFn: () => fetcher(params), placeholderData: keepPreviousData });

  return {
    rows: query.data?.data || [],
    pagination: query.data?.pagination,
    meta: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
    page, setPage,
    search,
    setSearch: (value) => { setSearchValue(value); setPage(1); },
    filters,
    setFilter: (key, value) => { setFilters((current) => ({ ...current, [key]: value })); setPage(1); },
    sort,
    toggleSort: (key) => setSort((current) => (current.key === key ? { key, dir: current.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' })),
  };
}
