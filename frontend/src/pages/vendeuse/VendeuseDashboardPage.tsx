import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ImageIcon,
  Package,
  Percent,
  Radio,
  ReceiptText,
  ShieldAlert,
  Truck,
  UserCheck,
  TrendingUp,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StatCard from '../../components/vendeuse/StatCard';
import PageHeader from '../../components/vendeuse/PageHeader';
import { useActivePromotionsCount } from '../../hooks/usePromotions';
import { useVendeuseOverview } from '../../hooks/useVendeuseOverview';
import { formatPrice } from '../../utils/formatPrice';
import { api } from '../../services/api';

function useLiveToggle() {
  const qc = useQueryClient();
  const { data: isLive = false } = useQuery({
    queryKey: ['settings', 'live'],
    queryFn: async () => {
      const { data } = await api.get<{ isLive: boolean }>('/settings/live');
      return data.isLive;
    },
    staleTime: 10_000,
  });
  const mutation = useMutation({
    mutationFn: async (value: boolean) => {
      const { data } = await api.patch<{ isLive: boolean }>('/settings/live', { isLive: value });
      return data.isLive;
    },
    onSuccess: (value) => qc.setQueryData(['settings', 'live'], value),
  });
  return { isLive, toggle: () => mutation.mutate(!isLive), isPending: mutation.isPending };
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const VendeuseDashboardPage = () => {
  const { data: overview, isPending: overviewLoading, isError: overviewError } = useVendeuseOverview();
  const { data: promosActives = 0 } = useActivePromotionsCount();
  const { isLive, toggle, isPending: liveTogglePending } = useLiveToggle();

  const awaitingValidation = overview?.kpi.reservations.awaiting_validation ?? 0;
  const awaitingDeposit = overview?.kpi.reservations.awaiting_deposit ?? 0;
  const prepOrders =
    (overview?.kpi.orders.preparation ?? 0) + (overview?.kpi.orders.emballage ?? 0);
  const shippedToday = overview?.kpi.orders.shippedToday ?? 0;
  const anomalies7d = overview?.kpi.payments.anomaliesLast7d ?? 0;

  const shortcuts = [
    { to: '/vendeuse/reservations', label: 'Réservations', icon: UserCheck, desc: 'Acomptes & validation' },
    { to: '/vendeuse/commandes', label: 'Commandes', icon: Package, desc: 'Préparation & expédition' },
    { to: '/vendeuse/livraisons', label: 'Livraisons', icon: CalendarDays, desc: 'Agenda & assignation' },
    { to: '/vendeuse/livreurs', label: 'Livreurs', icon: Truck, desc: 'Carnet partenaires' },
    { to: '/vendeuse/medias', label: 'Médias', icon: ImageIcon, desc: 'Visuels du site' },
    { to: '/vendeuse/promotions', label: 'Promotions', icon: Percent, desc: 'Codes & remises' },
  ];

  const todo = overview?.todo ?? [];

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Tableau de bord Vendeuse"
        description="Statistiques financières, gestion de stock et pépites les plus vendues."
      />

      {/* ── LIVE Toggle ── */}
      <div
        className={`mb-8 flex flex-col items-center gap-4 rounded-2xl border p-6 text-center transition-colors sm:flex-row sm:items-center sm:justify-between sm:text-left ${
          isLive
            ? 'border-live-red/40 bg-live-red/10'
            : 'border-white/10 bg-[#111]'
        }`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
              isLive ? 'bg-live-red/20' : 'bg-white/5'
            }`}
          >
            <Radio
              className={`h-6 w-6 ${isLive ? 'text-live-red' : 'text-neutral-500'}`}
              strokeWidth={2}
              aria-hidden
            />
            {isLive && (
              <span className="absolute h-3 w-3 animate-ping rounded-full bg-live-red/60" />
            )}
          </div>
          <div>
            <p className={`text-lg font-bold ${isLive ? 'text-live-red' : 'text-neutral-300'}`}>
              {isLive ? 'LIVE EN COURS' : 'Live inactif'}
            </p>
            <p className="text-xs text-neutral-500">
              {isLive
                ? 'Le badge clignote sur la boutique — tes clientes le voient maintenant'
                : 'Clique quand tu démarres ton live TikTok'}
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={liveTogglePending}
          onClick={toggle}
          className={`shrink-0 rounded-xl px-8 py-3 text-sm font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 ${
            isLive
              ? 'bg-live-red text-white hover:brightness-90'
              : 'bg-white/10 text-white hover:bg-white/20'
          }`}
        >
          {liveTogglePending ? '…' : isLive ? 'Terminer le live' : 'Démarrer le live'}
        </button>
      </div>

      {overviewError && (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          Impossible de charger les indicateurs. Vérifie que l'API tourne et que tu es bien connectée.
        </p>
      )}
      {overviewLoading && !overview && !overviewError && (
        <p className="mb-6 text-sm text-neutral-500">Chargement des indicateurs…</p>
      )}

      {overview && (
        <>
          {/* ── KPI CLASSIQUES ── */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="À valider (acompte reçu)"
              value={awaitingValidation}
              hint="Réservations en attente de ton OK"
              tone="purple"
              to="/vendeuse/reservations"
            />
            <StatCard
              label="Acomptes en attente"
              value={awaitingDeposit}
              hint="Clients pas encore payés"
              tone="orange"
              to="/vendeuse/reservations"
            />
            <StatCard
              label="Commandes actives"
              value={prepOrders}
              hint="Préparation ou emballage"
              tone="pink"
              to="/vendeuse/commandes"
            />
            <StatCard
              label="Expédiées aujourd'hui"
              value={shippedToday}
              hint="Commandes passées à expédiée"
              tone="cyan"
              to="/vendeuse/commandes"
            />
          </div>

          {/* ── CHIFFRES D'AFFAIRES & VENTES ── */}
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-tiktok-pink" />
              Chiffre d'Affaires & Ventes
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Aujourd'hui */}
              <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Aujourd'hui</span>
                  <span className="rounded bg-tiktok-pink/15 px-2 py-0.5 text-[10px] font-bold text-tiktok-pink">
                    {overview.kpi.sales.today.ordersCount} commande{overview.kpi.sales.today.ordersCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Revenu réel (confirmé)</p>
                  <p className="text-2xl font-black text-white">{formatPrice(overview.kpi.sales.today.confirmedFcfa)}</p>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-xs text-neutral-400">
                  <span>CA attendu :</span>
                  <span className="font-semibold text-white">{formatPrice(overview.kpi.sales.today.expectedFcfa)}</span>
                </div>
              </div>

              {/* Cette Semaine */}
              <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Cette Semaine</span>
                  <span className="rounded bg-tiktok-cyan/15 px-2 py-0.5 text-[10px] font-bold text-tiktok-cyan">
                    {overview.kpi.sales.week.ordersCount} commande{overview.kpi.sales.week.ordersCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Revenu réel (confirmé)</p>
                  <p className="text-2xl font-black text-white">{formatPrice(overview.kpi.sales.week.confirmedFcfa)}</p>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-xs text-neutral-400">
                  <span>CA attendu :</span>
                  <span className="font-semibold text-white">{formatPrice(overview.kpi.sales.week.expectedFcfa)}</span>
                </div>
              </div>

              {/* Ce Mois */}
              <div className="rounded-xl border border-white/10 bg-[#111] p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">Ce Mois</span>
                  <span className="rounded bg-reserve-purple/15 px-2 py-0.5 text-[10px] font-bold text-reserve-purple">
                    {overview.kpi.sales.month.ordersCount} commande{overview.kpi.sales.month.ordersCount > 1 ? 's' : ''}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Revenu réel (confirmé)</p>
                  <p className="text-2xl font-black text-white">{formatPrice(overview.kpi.sales.month.confirmedFcfa)}</p>
                </div>
                <div className="border-t border-white/5 pt-2 flex justify-between text-xs text-neutral-400">
                  <span>CA attendu :</span>
                  <span className="font-semibold text-white">{formatPrice(overview.kpi.sales.month.expectedFcfa)}</span>
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
                État des stocks (Vêtements)
              </h3>
              
              <div className="space-y-3 pt-2">
                {/* Disponible */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">En vente (disponibles)</span>
                    <span className="font-extrabold text-status-green">{overview.kpi.inventory.disponible} pièces</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-status-green rounded-full" style={{ width: `${Math.min(100, (overview.kpi.inventory.disponible / (overview.kpi.inventory.disponible + overview.kpi.inventory.reserver + overview.kpi.inventory.sold || 1)) * 100)}%` }} />
                  </div>
                </div>

                {/* Réservé */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Réservés (acompte versé/validation)</span>
                    <span className="font-extrabold text-reserve-purple">{overview.kpi.inventory.reserver} pièces</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-reserve-purple rounded-full" style={{ width: `${Math.min(100, (overview.kpi.inventory.reserver / (overview.kpi.inventory.disponible + overview.kpi.inventory.reserver + overview.kpi.inventory.sold || 1)) * 100)}%` }} />
                  </div>
                </div>

                {/* Vendu */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-neutral-400">Vendus (livrés/payés)</span>
                    <span className="font-extrabold text-neutral-400">{overview.kpi.inventory.sold} pièces</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full bg-neutral-600 rounded-full" style={{ width: `${Math.min(100, (overview.kpi.inventory.sold / (overview.kpi.inventory.disponible + overview.kpi.inventory.reserver + overview.kpi.inventory.sold || 1)) * 100)}%` }} />
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
              
              {overview.kpi.topSellers.length === 0 ? (
                <p className="text-xs text-neutral-500 pt-4">Aucune vente enregistrée sur les 30 derniers jours.</p>
              ) : (
                <div className="divide-y divide-white/5 space-y-2.5">
                  {overview.kpi.topSellers.map((seller) => (
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

          {/* ── ALERTS & ANOMALIES ── */}
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <ReceiptText className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
                Paiements (24h)
              </div>
              <p className="text-2xl font-bold text-white">
                {formatPrice(overview.kpi.payments.last24h.amountFcfaConfirmed)}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                {overview.kpi.payments.last24h.failedCount > 0 ? `${overview.kpi.payments.last24h.failedCount} échec(s) à traiter` : 'Aucun échec signalé'}
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <ShieldAlert className="h-4 w-4 text-amber-300" strokeWidth={2} aria-hidden />
                Anomalies (7j)
              </div>
              <p className="text-2xl font-bold text-white">{anomalies7d}</p>
              <p className="mt-1 text-xs text-neutral-500">
                Références payées introuvables (à réconcilier)
              </p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Percent className="h-4 w-4 text-tiktok-pink" strokeWidth={2} aria-hidden />
                Promotions actives
              </div>
              <p className="text-2xl font-bold text-white">{promosActives}</p>
              <p className="mt-1 text-xs text-neutral-500">Visible côté boutique (API publique)</p>
            </div>
          </div>
        </>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Raccourcis</h2>
      </div>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {shortcuts.map(({ to, label, icon: Icon, desc }) => (
          <Link
            key={to}
            to={to}
            className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#111] p-4 transition hover:border-white/20 hover:bg-[#141414]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-tiktok-cyan">
              <Icon className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-white">{label}</p>
              <p className="text-xs text-neutral-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <h2 id="vendeuse-todo" className="mb-4 scroll-mt-24 text-lg font-bold text-white">
        À faire maintenant
      </h2>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] mb-10">
        {overviewLoading && !overview && !overviewError ? (
          <p className="p-5 text-sm text-neutral-500">Chargement de la file…</p>
        ) : !overview ? (
          <p className="p-5 text-sm text-neutral-500">Indicateurs indisponibles.</p>
        ) : todo.length === 0 ? (
          <p className="p-5 text-sm text-neutral-500">Rien d'urgent détecté.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {todo.map((t) => (
              <li key={t.kind + t.reference} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">{t.title}</p>
                  <p className="truncate text-xs text-neutral-500">{t.subtitle}</p>
                  <p className="mt-1 font-mono text-[11px] text-tiktok-cyan">{t.reference}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-[11px] text-neutral-600">{fmt(t.createdAt)}</p>
                  <Link
                    to={
                      t.kind === 'order'
                        ? `/vendeuse/commandes?q=${encodeURIComponent(t.reference)}`
                        : `/vendeuse/reservations?q=${encodeURIComponent(t.reference)}`
                    }
                    className="mt-2 inline-block rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                  >
                    Ouvrir
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default VendeuseDashboardPage;
