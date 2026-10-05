import { useQuery } from '@tanstack/react-query';
import { metaService } from '@/services/metaService';
import { jobService } from '@/services/jobService';
import { FALLBACK_POPULAR_SEARCHES } from '@/constants';

const FIVE_MINUTES = 5 * 60 * 1000;

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: () => metaService.categories({ status: 'active' }), staleTime: FIVE_MINUTES, select: (res) => res.data });
}

export function useLocations() {
  return useQuery({ queryKey: ['locations'], queryFn: () => metaService.locations({ status: 'active' }), staleTime: FIVE_MINUTES, select: (res) => res.data });
}

// Popular searches are configured on the server; the constant list is only a fallback.
export function usePopularSearches() {
  const query = useQuery({ queryKey: ['popular-searches'], queryFn: jobService.popularSearches, staleTime: FIVE_MINUTES, retry: false, select: (res) => res.data });
  return query.data?.length ? query.data : FALLBACK_POPULAR_SEARCHES;
}
