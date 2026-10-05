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

const linkClass = ({ isActive }) => cn('rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900');

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isLoggedIn, isEmployer } = useAuth();
  const postJobPath = isEmployer ? '/employer/jobs/new' : '/register?role=EMPLOYER';
  const canPostJob = !isLoggedIn || isEmployer;

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" aria-label="Job Quest home"><Logo /></Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {PUBLIC_NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>{item.label}</NavLink>)}
        </nav>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button as={Link} to={ROLE_HOME[user.role]} variant="secondary" size="sm" className="hidden md:inline-flex">Dashboard</Button>
              <NotificationDropdown />
              <UserMenu />
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button as={Link} to="/login" variant="ghost" size="sm">Login</Button>
              <Button as={Link} to="/register" variant="outline" size="sm">Register</Button>
            </div>
          )}
          {canPostJob && <Button as={Link} to={postJobPath} size="sm" className="hidden md:inline-flex">Post a Job</Button>}
          <button type="button" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu className="h-6 w-6" /></button>
        </div>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menu" side="right">
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {PUBLIC_NAV.map((item) => <NavLink key={item.to} to={item.to} end={item.to === '/'} onClick={() => setMenuOpen(false)} className={linkClass}>{item.label}</NavLink>)}
          {isLoggedIn && (
            <>
              <p className="mt-4 px-3 text-xs font-semibold text-slate-400">Your account</p>
              {(ROLE_MENU[user.role] || []).map((item) => <NavLink key={item.to} to={item.to} onClick={() => setMenuOpen(false)} className={linkClass}>{item.label}</NavLink>)}
            </>
          )}
        </nav>
        <div className="mt-6 flex flex-col gap-2">
          {!isLoggedIn && (
            <>
              <Button as={Link} to="/login" variant="outline" onClick={() => setMenuOpen(false)}>Login</Button>
              <Button as={Link} to="/register" variant="outline" onClick={() => setMenuOpen(false)}>Register</Button>
            </>
          )}
          {canPostJob && <Button as={Link} to={postJobPath} onClick={() => setMenuOpen(false)}>Post a Job</Button>}
        </div>
      </Drawer>
    </header>
  );
}
