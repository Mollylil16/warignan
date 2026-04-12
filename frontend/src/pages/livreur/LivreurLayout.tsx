import { NavLink, Outlet } from 'react-router-dom';
import { Truck } from 'lucide-react';

const LivreurLayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#050505] text-white sm:flex-row">
      <aside className="shrink-0 border-b border-white/10 px-4 py-4 sm:w-56 sm:border-b-0 sm:border-r sm:px-3 sm:py-6">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-tiktok-cyan">
          Warignan
        </p>
        <p className="mb-4 text-sm font-bold text-neutral-200">Espace livreur</p>
        <nav className="flex gap-2 sm:flex-col sm:gap-1">
          <NavLink
            to="/livreur"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white/10 text-white'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-neutral-200'
              }`
            }
          >
            <Truck className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
            Mes livraisons
          </NavLink>
        </nav>
        <NavLink
          to="/"
          className="mt-4 hidden rounded-lg border border-white/15 px-3 py-2 text-center text-xs text-neutral-500 hover:border-tiktok-cyan/40 hover:text-tiktok-cyan sm:block"
        >
          Retour au site
        </NavLink>
      </aside>

      <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-8">
        <Outlet />
      </main>
    </div>
  );
};

export default LivreurLayout;
