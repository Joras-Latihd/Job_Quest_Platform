import Hero from '@/components/home/Hero';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedJobs from '@/components/home/FeaturedJobs';
import LatestJobs from '@/components/home/LatestJobs';
import PopularLocations from '@/components/home/PopularLocations';
import TrustedCompanies from '@/components/home/TrustedCompanies';
import ResourcesTeaser from '@/components/home/ResourcesTeaser';
import CtaSection from '@/components/home/CtaSection';
import useDocumentTitle from '@/hooks/useDocumentTitle';

export default function HomePage() {
  useDocumentTitle('Find jobs in Nepal');
  return (
    <>
      <Hero />
      <CategoryGrid />
      <FeaturedJobs />
      <LatestJobs />
      <PopularLocations />
      <TrustedCompanies />
      <ResourcesTeaser />
      <CtaSection />
    </>
  );
}
