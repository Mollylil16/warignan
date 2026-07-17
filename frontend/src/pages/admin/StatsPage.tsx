import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, Users, UserCheck, Layers, ShoppingBag } from 'lucide-react';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../utils/formatPrice';

type AdminStats = {
  caReel: number;
  caAttendu: number;
  totalOrders: number;
  ordersByStep: Record<string, number>;
  reservationsByWorkflow: Record<string, number>;
  trendCa7d: { date: string; amount: number }[];
  usersByRole: Record<string, number>;
  sales: {
    today: { confirmedFcfa: number; expectedFcfa: number; ordersCount: number };
    week: { confirmedFcfa: number; expectedFcfa: number; ordersCount: number };
    month: { confirmedFcfa: number; expectedFcfa: number; ordersCount: number };
  };
  inventory: { disponible: number; reserver: number; sold: number };
  topSellers: Array<{ code: string; qty: number; nom: string; prix: number; image: string }>;
};

const stepLabel: Record<string, string> = {
  preparation: 'Préparation',
  emballage: 'Emballage',
  expediee: 'Expédiée',
  livree: 'Livrée',
};

const workflowLabel: Record<string, string> = {
  awaiting_deposit: 'Acompte attendu',
  awaiting_validation: 'À valider',
  validated: 'Validée',
  cancelled: 'Annulée',
};

function TrendBar({ data }: { data: { date: string; amount: number }[] }) {
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex h-28 items-end gap-1.5 sm:gap-2">
      {data.map(({ date, amount }) => {
        const pct = Math.round((amount / max) * 100);
        const label = new Date(date + 'T12:00:00Z').toLocaleDateString('fr-FR', {
          weekday: 'short',
        });
        return (
          <div key={date} className="group relative flex flex-1 flex-col items-center gap-1">
            <div
              className="w-full rounded-t-sm bg-tiktok-pink/70 transition-all hover:bg-tiktok-pink"
              style={{ height: `${Math.max(pct, 2)}%` }}
            />
            <span className="text-[9px] text-neutral-600 group-hover:text-neutral-400">{label}</span>
            {amount > 0 && (
              <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-[#1a1a1a] px-1.5 py-0.5 text-[9px] font-semibold text-white group-hover:block">
                {formatPrice(amount)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

const StatsPage = () => {
  const token = useAuthStore((s) => s.token);
  const { data, isPending, error } = useQuery({
    queryKey: ['dashboard', 'admin', token],
    queryFn: async () => {
      const { data } = await api.get<AdminStats>('/dashboard/admin');
      return data;
    },
    enabled: Boolean(token),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

  const totalReservations = data
    ? Object.values(data.reservationsByWorkflow).reduce((s, n) => s + n, 0)
    : 0;

  return (
    <div className="max-w-5xl">
      <h1 className="mb-1 text-2xl font-bold text-white">Tableau de bord Admin</h1>
      <p className="mb-8 text-sm text-neutral-500">Données financières et statistiques du site — rafraîchissement auto 60s.</p>

      {error && (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {String(error)}
        </p>
      )}

      {isPending && (
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse rounded-xl border border-white/10 bg-[#111] p-6">
              <div className="mb-3 h-3 w-24 rounded bg-white/5" />
              <div className="mb-2 h-8 w-16 rounded bg-white/5" />
              <div className="h-3 w-32 rounded bg-white/5" />
            </div>
          ))}
        </div>
      )}

      {data && (
        <>
          {/* KPIs financiers globaux */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-tiktok-cyan/20 bg-tiktok-cyan/5 p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-tiktok-cyan">
                <TrendingUp className="h-4 w-4" strokeWidth={2} aria-hidden />
                CA réel encaissé
              </div>
              <p className="text-2xl font-bold text-white">{formatPrice(data.caReel)}</p>
              <p className="mt-1 text-xs text-neutral-500">Somme paiements confirmés</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                <Package className="h-4 w-4" strokeWidth={2} aria-hidden />
                CA attendu
              </div>
              <p className="text-2xl font-bold text-white">{formatPrice(data.caAttendu)}</p>
              <p className="mt-1 text-xs text-neutral-500">Total commandes (toutes étapes)</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-tiktok-pink">
                <Package className="h-4 w-4" strokeWidth={2} aria-hidden />
                Commandes
              </div>
              <p className="text-2xl font-bold text-white">{data.totalOrders}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {data.ordersByStep.preparation ?? 0} en préparation
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-reserve-purple">
                <UserCheck className="h-4 w-4" strokeWidth={2} aria-hidden />
                Réservations
              </div>
              <p className="text-2xl font-bold text-white">{totalReservations}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {data.reservationsByWorkflow.awaiting_validation ?? 0} à valider
              </p>
            </div>
          </div>

          {/* ── CHIFFRES D'AFFAIRES & VENTES (DÉTAILLÉS) ── */}
          <div className="mb-8">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-neutral-400">Performance Chiffre d'Affaires</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Aujourd'hui */}
              <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Aujourd'hui</span>
                  <span className="rounded bg-tiktok-pink/15 px-2 py-0.5 text-[10px] font-bold text-tiktok-pink">
                    {data.sales.today.ordersCount} cmd
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Confirmé : <strong className="text-white">{formatPrice(data.sales.today.confirmedFcfa)}</strong></p>
                  <p className="text-xs text-neutral-500 mt-1">Attendu : <strong className="text-neutral-300">{formatPrice(data.sales.today.expectedFcfa)}</strong></p>
                </div>
              </div>

              {/* Cette Semaine */}
              <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Cette Semaine</span>
                  <span className="rounded bg-tiktok-cyan/15 px-2 py-0.5 text-[10px] font-bold text-tiktok-cyan">
                    {data.sales.week.ordersCount} cmd
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Confirmé : <strong className="text-white">{formatPrice(data.sales.week.confirmedFcfa)}</strong></p>
                  <p className="text-xs text-neutral-500 mt-1">Attendu : <strong className="text-neutral-300">{formatPrice(data.sales.week.expectedFcfa)}</strong></p>
                </div>
              </div>

              {/* Ce Mois */}
              <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Ce Mois</span>
                  <span className="rounded bg-reserve-purple/15 px-2 py-0.5 text-[10px] font-bold text-reserve-purple">
                    {data.sales.month.ordersCount} cmd
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Confirmé : <strong className="text-white">{formatPrice(data.sales.month.confirmedFcfa)}</strong></p>
                  <p className="text-xs text-neutral-500 mt-1">Attendu : <strong className="text-neutral-300">{formatPrice(data.sales.month.expectedFcfa)}</strong></p>
                </div>
              </div>
            </div>
          </div>

          {/* ── STOCKS & MEILLEURES VENTES ── */}
          <div className="mb-8 grid gap-4 md:grid-cols-2">
            {/* Stocks */}
            <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-tiktok-cyan" />
                Stocks de la boutique
              </h3>
              
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Disponibles</span>
                    <span className="font-extrabold text-status-green">{data.inventory.disponible} pièces</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-status-green rounded-full" style={{ width: `${Math.min(100, (data.inventory.disponible / (data.inventory.disponible + data.inventory.reserver + data.inventory.sold || 1)) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Réservés</span>
                    <span className="font-extrabold text-reserve-purple">{data.inventory.reserver} pièces</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-reserve-purple rounded-full" style={{ width: `${Math.min(100, (data.inventory.reserver / (data.inventory.disponible + data.inventory.reserver + data.inventory.sold || 1)) * 100)}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Vendus</span>
                    <span className="font-extrabold text-neutral-400">{data.inventory.sold} pièces</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-neutral-600 rounded-full" style={{ width: `${Math.min(100, (data.inventory.sold / (data.inventory.disponible + data.inventory.reserver + data.inventory.sold || 1)) * 100)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Meilleures Ventes */}
            <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-tiktok-pink" />
                Meilleures Ventes (30j)
              </h3>
              
              {data.topSellers.length === 0 ? (
                <p className="text-xs text-neutral-500 pt-4">Aucune vente récente.</p>
              ) : (
                <div className="divide-y divide-white/5 space-y-2.5">
                  {data.topSellers.map((seller) => (
                    <div key={seller.code} className="flex items-center gap-3 pt-2.5 first:pt-0">
                      <div className="h-10 w-8 shrink-0 overflow-hidden rounded bg-[#1a1a1a]">
                        {seller.image ? (
                          <img src={seller.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full bg-neutral-800" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">{seller.nom}</p>
                        <p className="text-[10px] text-neutral-500 font-mono">{seller.code} — {formatPrice(seller.prix)}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="inline-block rounded-full bg-tiktok-pink/10 border border-tiktok-pink/20 px-2.5 py-0.5 text-xs font-bold text-tiktok-pink">
                          {seller.qty} vendus
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tendance 7j */}
          <div className="mb-8 rounded-xl border border-white/10 bg-[#111] p-5">
            <p className="mb-4 text-sm font-semibold text-white">Encaissements — 7 derniers jours</p>
            {data.trendCa7d.every((d) => d.amount === 0) ? (
              <p className="text-sm text-neutral-600">Aucun paiement confirmé sur cette période.</p>
            ) : (
              <TrendBar data={data.trendCa7d} />
            )}
          </div>

          {/* Détail étapes et utilisateurs */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="mb-4 text-sm font-semibold text-white">Commandes par étape</p>
              <dl className="space-y-2">
                {Object.entries(stepLabel).map(([step, label]) => (
                  <div key={step} className="flex justify-between text-sm">
                    <dt className="text-neutral-400">{label}</dt>
                    <dd className="font-semibold text-white">{data.ordersByStep[step] ?? 0}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <p className="mb-4 text-sm font-semibold text-white">Réservations par état</p>
              <dl className="space-y-2">
                {Object.entries(workflowLabel).map(([wf, label]) => (
                  <div key={wf} className="flex justify-between text-sm">
                    <dt className="text-neutral-400">{label}</dt>
                    <dd className="font-semibold text-white">{data.reservationsByWorkflow[wf] ?? 0}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Utilisateurs par rôle */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-5">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
              <Users className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
              Comptes par rôle
            </div>
            <div className="flex flex-wrap gap-4">
              {Object.entries(data.usersByRole).map(([role, count]) => (
                <div key={role} className="text-sm">
                  <span className="text-neutral-500 capitalize">{role} </span>
                  <span className="font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StatsPage;
