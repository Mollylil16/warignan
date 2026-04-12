import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Package, Users } from 'lucide-react';

const links: { to: string; label: string; end?: boolean; icon: typeof BarChart3 }[] = [
  { to: '/admin', label: 'Tableau de bord', end: true, icon: BarChart3 },
  { to: '/admin/commandes', label: 'Toutes les commandes', icon: Package },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
];

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-[#060606] text-white">
      <aside className="flex w-56 shrink-0 flex-col border-r border-white/10 px-3 py-6 sm:w-64 sm:px-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-tiktok-cyan">
          Warignan
        </p>
        <p className="mb-6 text-sm font-bold text-neutral-200">Administration</p>
        <nav className="flex flex-1 flex-col gap-0.5">
          {links.map(({ to, label, end, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={Boolean(end)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/"
          className="mt-6 rounded-lg border border-white/15 px-3 py-2 text-center text-xs text-neutral-500 hover:border-tiktok-pink/40 hover:text-tiktok-pink"
        >
          Retour au site
        </NavLink>
      </aside>

      <main className="min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
