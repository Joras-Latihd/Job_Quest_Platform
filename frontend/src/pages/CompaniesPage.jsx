import { useState } from 'react';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Building2, Search } from 'lucide-react';
import CompanyCard from '@/components/companies/CompanyCard';
import CompanyCardSkeleton from '@/components/companies/CompanyCardSkeleton';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import useDebounce from '@/hooks/useDebounce';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { useLocations } from '@/hooks/useMeta';
import { companyService } from '@/services/companyService';
import { COMPANY_SIZES, INDUSTRIES } from '@/constants';

export default function CompaniesPage() {
  useDocumentTitle('Companies');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ industry: '', location: '', size: '' });
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search);
  const { data: locations = [] } = useLocations();

  const params = { search: debouncedSearch || undefined, industry: filters.industry || undefined, location: filters.location || undefined, size: filters.size || undefined, page, limit: 12 };
  const query = useQuery({ queryKey: ['companies', params], queryFn: () => companyService.list(params), placeholderData: keepPreviousData });
  const companies = query.data?.data || [];
  const change = (key) => (event) => { setFilters({ ...filters, [key]: event.target.value }); setPage(1); };

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Companies</h1>
      <p className="mt-1 text-slate-500">Explore employers and see what they are hiring for.</p>

      <div className="card mt-6 grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Search" leftIcon={Search} placeholder="Company name" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select label="Industry" placeholder="All industries" options={INDUSTRIES} value={filters.industry} onChange={change('industry')} />
        <Select label="Location" placeholder="All locations" options={locations.map((item) => ({ value: item.city, label: item.city }))} value={filters.location} onChange={change('location')} />
        <Select label="Company size" placeholder="Any size" options={COMPANY_SIZES} value={filters.size} onChange={change('size')} />
      </div>

      <div className="mt-6">
        {query.isError ? <ErrorState onRetry={query.refetch} /> : query.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><CompanyCardSkeleton /></div>
        ) : companies.length === 0 ? (
          <EmptyState icon={Building2} title="No companies found" description="Try a different search or clear a filter." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{companies.map((company) => <CompanyCard key={company._id} company={company} />)}</div>
        )}
        <Pagination pagination={query.data?.pagination} onPageChange={setPage} />
      </div>
    </div>
  );
}
