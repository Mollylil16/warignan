import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LogOut, Package, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const links: { to: string; label: string; end?: boolean; icon: typeof BarChart3 }[] = [
  { to: '/admin', label: 'Tableau de bord', end: true, icon: BarChart3 },
  { to: '/admin/commandes', label: 'Toutes les commandes', icon: Package },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: Users },
];

const AdminLayout = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-screen bg-[#060606] text-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 px-3 py-6 sm:flex sm:w-64 sm:px-4">
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
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="mb-0.5 truncate text-xs font-medium text-neutral-300">{user?.displayName}</p>
          <p className="mb-2 truncate text-[10px] text-neutral-500">{user?.email}</p>
          <button
            type="button"
            onClick={() => logout()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/15 py-2 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Déconnexion
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[100] border-b border-white/10 bg-[#060606]/90 px-4 py-3 backdrop-blur-md sm:hidden">
          <nav className="flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
            {links.map(({ to, label, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={Boolean(end)}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide inline-flex items-center gap-2 ${
                    isActive ? 'bg-white/10 text-white' : 'bg-white/5 text-neutral-400'
                  }`
                }
              >
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
                {label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => logout()}
              className="shrink-0 rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-neutral-300"
            >
              Déconnexion
            </button>
          </nav>
        </header>

        <main className="min-h-0 min-w-0 flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
