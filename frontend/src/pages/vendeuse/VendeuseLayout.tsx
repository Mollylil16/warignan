import { type FormEvent, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useVendeuseOverview } from '../../hooks/useVendeuseOverview';

const links: { to: string; label: string; end?: boolean }[] = [
  { to: '/vendeuse', label: "Vue d'ensemble", end: true },
  { to: '/vendeuse/produits', label: 'Produits / tenues' },
  { to: '/vendeuse/reservations', label: 'Réservations' },
  { to: '/vendeuse/commandes', label: 'Commandes' },
  { to: '/vendeuse/paiements', label: 'Paiements' },
  { to: '/vendeuse/livraisons', label: 'Livraisons & agenda' },
  { to: '/vendeuse/livreurs', label: 'Livreurs' },
  { to: '/vendeuse/medias', label: 'Images du site' },
  { to: '/vendeuse/promotions', label: 'Réductions' },
];

const VendeuseLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { data: overview } = useVendeuseOverview();
  const [headerSearch, setHeaderSearch] = useState('');

  const todoCount = overview?.todo?.length ?? 0;

  const submitHeaderSearch = (e: FormEvent) => {
    e.preventDefault();
    const t = headerSearch.trim();
    if (!t) return;
    const toReservations = /^WRG-RES/i.test(t);
    const path = toReservations ? '/vendeuse/reservations' : '/vendeuse/commandes';
    navigate(`${path}?q=${encodeURIComponent(t)}`);
  };

  const goToNotifications = () => {
    void qc.invalidateQueries({ queryKey: ['dashboard', 'vendeuse'] });
    if (location.pathname === '/vendeuse') {
      document.getElementById('vendeuse-todo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    void navigate('/vendeuse');
  };

  return (
    <div className="flex min-h-screen bg-[#070707] text-white">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-white/10 px-3 py-6 sm:flex sm:w-64 sm:px-4">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-tiktok-pink">
          Warignan
        </p>
        <p className="mb-6 text-sm font-bold text-neutral-200">Espace vendeuse</p>
        <nav className="flex flex-1 flex-col gap-0.5">
          {links.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={Boolean(end)}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <NavLink
          to="/fouille"
          className="mt-6 rounded-lg border border-white/15 px-3 py-2 text-center text-xs text-neutral-500 hover:border-tiktok-cyan/40 hover:text-tiktok-cyan"
        >
          Voir la boutique
        </NavLink>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-[100] flex flex-wrap items-center gap-3 border-b border-white/10 bg-[#070707]/90 px-4 py-3 backdrop-blur-md sm:px-6">
          <nav className="flex w-full gap-2 overflow-x-auto pb-1 sm:hidden [&::-webkit-scrollbar]:hidden">
            {links.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={Boolean(end)}
                className={({ isActive }) =>
                  `shrink-0 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${
                    isActive
                      ? 'bg-reserve-purple text-white'
                      : 'bg-white/5 text-neutral-400'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <form
            onSubmit={submitHeaderSearch}
            className="relative min-w-[200px] max-w-md flex-1"
            role="search"
          >
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              strokeWidth={2}
              aria-hidden
            />
            <input
              type="search"
              value={headerSearch}
              onChange={(e) => setHeaderSearch(e.target.value)}
              placeholder="Réf., client, ville… (WRG-RES… → réservations)"
              className="w-full rounded-lg border border-white/10 bg-[#111] py-2 pl-10 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-reserve-purple/50 focus:outline-none focus:ring-1 focus:ring-reserve-purple/40"
              aria-label="Rechercher commandes ou réservations"
            />
          </form>
          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => goToNotifications()}
              className="relative rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
              aria-label={
                todoCount > 0
                  ? `Tâches urgentes : ${todoCount} — ouvrir le tableau de bord`
                  : 'Tableau de bord — rien d’urgent'
              }
              title="Tâches & tableau de bord"
            >
              <Bell className="h-5 w-5" strokeWidth={2} />
              {todoCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-tiktok-pink px-1 text-[10px] font-bold text-white">
                  {todoCount > 9 ? '9+' : todoCount}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#111] py-1 pl-1 pr-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-reserve-purple to-tiktok-pink text-xs font-bold text-white"
                aria-hidden
              >
                {(user?.displayName ?? 'W').slice(0, 1).toUpperCase()}
              </div>
              <div className="min-w-0 text-left">
                <p className="truncate text-xs font-semibold text-white">{user?.displayName}</p>
                <p className="truncate text-[10px] text-neutral-500">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
                title="Déconnexion"
                aria-label="Déconnexion"
              >
                <LogOut className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendeuseLayout;
