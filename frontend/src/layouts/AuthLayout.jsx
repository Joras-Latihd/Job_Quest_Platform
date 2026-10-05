import { Link, Outlet } from 'react-router-dom';
import { Briefcase, ShieldCheck, Users } from 'lucide-react';
import Logo from '@/components/ui/Logo';

const points = [
  { icon: Briefcase, text: 'Search and filter openings across Nepal' },
  { icon: Users, text: 'Apply once, track every stage of your application' },
  { icon: ShieldCheck, text: 'Employers are reviewed before their jobs go live' },
];

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-4 py-8 sm:px-10">
        <Link to="/" aria-label="Job Quest home"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10"><Outlet /></div>
      </div>
      <aside className="relative hidden overflow-hidden bg-brand-700 lg:block" aria-hidden="true">
        <svg className="absolute inset-x-0 bottom-0 w-full text-brand-800" viewBox="0 0 800 300" preserveAspectRatio="none"><path fill="currentColor" d="M0 300V190l120-90 90 70 140-130 120 110 90-60 120 100 120-80v290z" /></svg>
        <div className="relative flex h-full flex-col justify-center px-14 text-white">
          <h2 className="font-display text-4xl font-bold leading-tight !text-white">Find the right opportunity. Build your next chapter.</h2>
          <ul className="mt-8 space-y-4">
            {points.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-brand-100"><Icon className="h-5 w-5 text-accent-400" /> {text}</li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
