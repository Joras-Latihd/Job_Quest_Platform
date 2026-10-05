import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, ExternalLink } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import Drawer from '@/components/ui/Drawer';
import NotificationDropdown from '@/components/common/NotificationDropdown';
import UserMenu from '@/components/common/UserMenu';
import { cn } from '@/utils/cn';

/*
 * One shell for all three dashboards.
 *  variant "light": job seeker + employer (productivity tool)
 *  variant "dark":  admin (management software)
 */
export default function DashboardShell({ nav, label, variant = 'light' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { pathname } = useLocation();
  const dark = variant === 'dark';
  useEffect(() => { setDrawerOpen(false); window.scrollTo(0, 0); }, [pathname]);

  const links = (
    <ul className="space-y-1">
      {nav.map(({ to, label: itemLabel, icon: Icon, end }) => (
        <li key={to}>
          <NavLink
            to={to}
            end={end}
            className={({ isActive }) => cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              dark
                ? isActive ? 'bg-white/15 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                : isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" /> {itemLabel}
          </NavLink>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="min-h-screen lg:pl-64">
      <aside className={cn('fixed inset-y-0 left-0 hidden w-64 flex-col border-r lg:flex', dark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white')}>
        <div className="px-5 py-5">
          <Link to="/" aria-label="Job Quest home"><Logo light={dark} /></Link>
          <p className={cn('mt-1 text-xs', dark ? 'text-slate-400' : 'text-slate-500')}>{label}</p>
        </div>
        <nav aria-label={label} className="flex-1 overflow-y-auto px-3 pb-6">{links}</nav>
      </aside>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={label} className={dark ? '!bg-slate-900 text-white' : ''}>
        <nav aria-label={label}>{links}</nav>
      </Drawer>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <button type="button" onClick={() => setDrawerOpen(true)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu className="h-6 w-6" /></button>
          <span className="hidden text-sm font-medium text-slate-500 lg:block">{label}</span>
          <div className="flex items-center gap-2">
            <Link to="/" className="mr-1 hidden items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 sm:flex">View site <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></Link>
            <NotificationDropdown />
            <UserMenu />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
