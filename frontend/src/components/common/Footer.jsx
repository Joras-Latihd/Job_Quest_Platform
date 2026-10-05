import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { SOCIAL_LINKS } from '@/constants';

const columns = [
  { title: 'Job Seekers', links: [['Find Jobs', '/find-jobs'], ['Saved Jobs', '/dashboard/saved-jobs'], ['Applications', '/dashboard/applications'], ['Job Alerts', '/dashboard/alerts'], ['Career Resources', '/career-resources']] },
  { title: 'Employers', links: [['Post a Job', '/employer/jobs/new'], ['Employer Dashboard', '/employer/dashboard'], ['Find Candidates', '/employer/applicants'], ['Company Profile', '/employer/company']] },
  { title: 'Company', links: [['About', '/about'], ['Contact', '/contact'], ['Privacy Policy', '/privacy'], ['Terms', '/terms']] },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="container-page grid gap-10 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-slate-400">Find the right opportunity. Build your next chapter. Job Quest connects job seekers and employers across Nepal.</p>
          <ul className="mt-5 flex gap-4 text-sm">
            {SOCIAL_LINKS.map((item) => <li key={item.label}><a href={item.href} className="text-slate-400 hover:text-white">{item.label}</a></li>)}
          </ul>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="font-sans text-sm font-semibold text-white">{column.title}</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {column.links.map(([label, to]) => <li key={label}><Link to={to} className="text-slate-400 hover:text-white">{label}</Link></li>)}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-slate-800 py-5 text-center text-xs text-slate-500">
        &copy; {new Date().getFullYear()} Job Quest. A classroom MERN project - all listings in development builds are demo data.
      </div>
    </footer>
  );
}
