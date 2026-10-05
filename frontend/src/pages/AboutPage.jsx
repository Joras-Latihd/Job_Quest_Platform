import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Building2, FileText, Search, UserRound } from 'lucide-react';
import Button from '@/components/ui/Button';
import useDocumentTitle from '@/hooks/useDocumentTitle';
import { jobService } from '@/services/jobService';

const steps = [
  { icon: UserRound, title: 'Create a profile', text: 'Add your experience, skills and resume once.' },
  { icon: Search, title: 'Search with filters', text: 'Narrow openings by location, category, salary and more.' },
  { icon: FileText, title: 'Apply and track', text: 'Apply in a few steps and follow every status change.' },
  { icon: Building2, title: 'Employers review', text: 'Companies post jobs, review applicants and schedule interviews.' },
];

export default function AboutPage() {
  useDocumentTitle('About');
  const { data: stats } = useQuery({ queryKey: ['platform-stats'], queryFn: jobService.stats, select: (res) => res.data, retry: false });
  const figures = [['Active jobs', stats?.jobs], ['Companies', stats?.companies], ['Job seekers', stats?.candidates], ['Applications', stats?.applications]];

  return (
    <div>
      <section className="bg-brand-700 py-16 text-white">
        <div className="container-page">
          <h1 className="max-w-2xl text-4xl font-bold !text-white">Hiring and job search, built for Nepal</h1>
          <p className="mt-4 max-w-2xl text-lg text-brand-100">Job Quest is a job portal that connects job seekers, employers and a moderation team on a single platform.</p>
        </div>
      </section>

      <section className="container-page grid gap-10 py-14 md:grid-cols-2">
        <div>
          <h2 className="section-title">Our mission</h2>
          <p className="mt-3 text-slate-600">Make it simple for people in Nepal to find work that fits their skills, and for employers to find reliable candidates without noise. Every employer is reviewed and every listing can be reported, so job seekers can focus on real opportunities.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="card p-5"><h3 className="text-lg font-semibold">For job seekers</h3><p className="mt-1 text-sm text-slate-600">Free profiles, saved jobs, job alerts and application tracking.</p></div>
          <div className="card p-5"><h3 className="text-lg font-semibold">For employers</h3><p className="mt-1 text-sm text-slate-600">Company pages, job posting, applicant management and interview scheduling.</p></div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <h2 className="section-title">How it works</h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className="card p-5">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Icon className="h-5 w-5" aria-hidden="true" /></span>
                <h3 className="mt-3 text-base font-semibold">{index + 1}. {title}</h3>
                <p className="mt-1 text-sm text-slate-600">{text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-14">
        <h2 className="section-title">Platform statistics</h2>
        <p className="mt-1 text-sm text-slate-500">Live counts from this installation. In development and class demos these come from generated demo data.</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {figures.map(([label, value]) => <div key={label} className="card p-5"><dt className="text-sm text-slate-500">{label}</dt><dd className="font-display text-3xl font-bold">{value ?? '-'}</dd></div>)}
        </dl>
        <div className="mt-10 flex gap-3"><Button as={Link} to="/find-jobs">Browse jobs</Button><Button as={Link} to="/contact" variant="outline">Contact us</Button></div>
      </section>
    </div>
  );
}
