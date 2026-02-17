import { Link, NavLink } from 'react-router-dom';
import { PropsWithChildren } from 'react';

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/rooms', label: 'Rooms' },
  { to: '/alerts', label: 'Alerts' },
  { to: '/analytics', label: 'Analytics' }
];

export function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-bold text-cyan-400">PowerSense Technologies Ltd</Link>
          <nav className="flex gap-5 text-sm">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'text-cyan-300' : 'text-slate-300 transition hover:text-cyan-200'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
