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
  const payments24hAmount = overview?.kpi.payments.last24h.amountFcfaConfirmed ?? 0;
  const payments24hFailed = overview?.kpi.payments.last24h.failedCount ?? 0;
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
        title="Tableau de bord"
        description="Vue synthétique alimentée par l'API."
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
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <ReceiptText className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
                Paiements (24h)
              </div>
              <p className="text-2xl font-bold text-white">{formatPrice(payments24hAmount)}</p>
              <p className="mt-1 text-xs text-neutral-500">
                {payments24hFailed > 0 ? `${payments24hFailed} échec(s) à traiter` : 'Aucun échec signalé'}
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
        <span className="text-xs text-neutral-500">
          {promosActives} code{promosActives !== 1 ? 's' : ''} promo actif{promosActives !== 1 ? 's' : ''} (API)
        </span>
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
      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c]">
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
