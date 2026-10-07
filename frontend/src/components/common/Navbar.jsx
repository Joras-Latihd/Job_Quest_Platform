import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Drawer from '@/components/ui/Drawer';
import UserMenu from './UserMenu';
import NotificationDropdown from './NotificationDropdown';
import useAuth from '@/hooks/useAuth';
import { PUBLIC_NAV, ROLE_MENU, ROLE_HOME } from '@/constants/navigation';
import { cn } from '@/utils/cn';

const linkClass = ({ isActive }) => cn(
  'relative rounded-xl px-3 py-2 text-sm font-semibold tracking-[0.01em] transition-all duration-200',
  isActive
    ? 'bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_rgba(58,98,238,0.1)] before:absolute before:-bottom-1 before:left-3 before:h-0.5 before:w-[calc(100%-1.5rem)] before:rounded-full before:bg-brand-600 before:content-[""]'
    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:shadow-[inset_0_0_0_1px_rgba(148,163,184,0.12)]',
);

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoggedIn, isEmployer } = useAuth();
  const postJobPath = isEmployer ? '/employer/jobs/new' : '/register?role=EMPLOYER';
  const canPostJob = !isLoggedIn || isEmployer;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 shadow-[0_1px_0_rgba(15,23,42,0.02),0_10px_30px_-20px_rgba(31,57,174,0.45)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-300/70 to-transparent" aria-hidden="true" />

      <div className="container-page relative flex h-16 items-center justify-between gap-3 sm:h-20 sm:gap-4">
        <Link to="/" aria-label="Job Quest home" className="group shrink-0 rounded-xl p-1.5 transition hover:bg-brand-50"><Logo className="group-hover:scale-[1.02]" /></Link>

        <nav aria-label="Main" className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-50/90 p-1.5 shadow-inner shadow-slate-200/60 lg:flex">
          {PUBLIC_NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>{item.label}</NavLink>)}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          {isLoggedIn ? (
            <>
              <Button as={Link} to={ROLE_HOME[user.role]} variant="secondary" size="sm" className="hidden rounded-xl font-semibold shadow-sm shadow-brand-600/10 md:inline-flex">Dashboard</Button>
              <NotificationDropdown />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm" className="rounded-xl font-semibold">Login</Button>
              <Button as={Link} to="/register" variant="outline" size="sm" className="rounded-xl border-slate-300 bg-white px-4 font-semibold shadow-sm shadow-slate-200/60 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700">Register</Button>
            </div>
          )}
          {canPostJob && <Button as={Link} to={postJobPath} size="sm" className="hidden rounded-xl bg-brand-600 px-4 font-semibold text-white shadow-lg shadow-brand-600/20 hover:-translate-y-0.5 hover:bg-brand-700 hover:shadow-xl hover:shadow-brand-600/25 md:inline-flex">Post a Job</Button>}
          <button type="button" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/30 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="right" className="border-l border-slate-200 bg-slate-50/95">
        <nav aria-label="Mobile" className="flex flex-col gap-1.5">
          {PUBLIC_NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMenuOpen(false)} className={({ isActive }) => cn('rounded-xl px-3 py-3 text-sm font-semibold transition', isActive ? 'bg-brand-50 text-brand-700 shadow-[inset_0_0_0_1px_rgba(58,98,238,0.08)]' : 'text-slate-700 hover:bg-white hover:text-brand-700')}>{item.label}</NavLink>)}
          {isLoggedIn && (
            <>
              <p className="mt-4 px-3 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Your account</p>
              {(ROLE_MENU[user.role] || []).map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={({ isActive }) => cn('rounded-xl px-3 py-3 text-sm font-semibold transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-700 hover:bg-white hover:text-brand-700')}>{item.label}</NavLink>)}
            </>
          )}
        </nav>
        <div className="mt-6 flex flex-col gap-2 border-t border-slate-200 pt-5">
          {!isLoggedIn && (
            <>
              <Button as={Link} to="/login" variant="outline" onClick={() => setMenuOpen(false)} className="rounded-xl font-semibold">Login</Button>
              <Button as={Link} to="/register" variant="outline" onClick={() => setMenuOpen(false)} className="rounded-xl border-brand-200 bg-brand-50 font-semibold text-brand-700 hover:bg-brand-100">Register</Button>
            </>
          )}
          {canPostJob && <Button as={Link} to={postJobPath} onClick={() => setMenuOpen(false)} className="rounded-xl bg-brand-600 font-semibold text-white shadow-lg shadow-brand-600/20 hover:bg-brand-700">Post a Job</Button>}
        </div>
      </Drawer>
    </header>
  );
}
