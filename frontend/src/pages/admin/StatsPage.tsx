import { useQuery } from '@tanstack/react-query';
import { Package, TrendingUp, Users, UserCheck } from 'lucide-react';
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
      <h1 className="mb-1 text-2xl font-bold text-white">Tableau de bord</h1>
      <p className="mb-8 text-sm text-neutral-500">Données en temps réel — rafraîchissement auto 60s.</p>

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
          {/* KPIs financiers */}
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
