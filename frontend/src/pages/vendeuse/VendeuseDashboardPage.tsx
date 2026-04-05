import { Link } from 'react-router-dom';
import {
  CalendarDays,
  ImageIcon,
  Package,
  Percent,
  Truck,
  UserCheck,
} from 'lucide-react';
import StatCard from '../../components/vendeuse/StatCard';
import PageHeader from '../../components/vendeuse/PageHeader';
import {
  mockDeliveries,
  mockOrders,
  mockPromotions,
  mockReservations,
} from '../../data/vendeuseMock';
import { formatPrice } from '../../utils/formatPrice';

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

const VendeuseDashboardPage = () => {
  const awaitingValidation = mockReservations.filter(
    (r) => r.workflow === 'awaiting_validation'
  ).length;
  const awaitingDeposit = mockReservations.filter(
    (r) => r.workflow === 'awaiting_deposit'
  ).length;
  const prepOrders = mockOrders.filter((o) => o.step === 'preparation' || o.step === 'emballage')
    .length;
  const livraisonsAPlanifier = mockDeliveries.filter((d) => d.status !== 'done').length;
  const promosActives = mockPromotions.filter((p) => p.active).length;

  const shortcuts = [
    { to: '/vendeuse/reservations', label: 'Réservations', icon: UserCheck, desc: 'Acomptes & validation' },
    { to: '/vendeuse/commandes', label: 'Commandes', icon: Package, desc: 'Préparation & expédition' },
    { to: '/vendeuse/livraisons', label: 'Livraisons', icon: CalendarDays, desc: 'Agenda & assignation' },
    { to: '/vendeuse/livreurs', label: 'Livreurs', icon: Truck, desc: 'Carnet partenaires' },
    { to: '/vendeuse/medias', label: 'Médias', icon: ImageIcon, desc: 'Visuels du site' },
    { to: '/vendeuse/promotions', label: 'Promotions', icon: Percent, desc: 'Codes & remises' },
  ];

  const recent = [
    ...mockReservations.slice(0, 2).map((r) => ({
      id: r.id,
      type: 'Réservation' as const,
      label: r.reference,
      detail: r.clientName,
      time: r.createdAt,
    })),
    ...mockOrders.slice(0, 2).map((o) => ({
      id: o.id,
      type: 'Commande' as const,
      label: o.reference,
      detail: formatPrice(o.totalFcfa),
      time: o.paidAt,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Tableau de bord"
        description="Vue synthétique : priorités du jour, accès rapide aux modules. Les données sont fictives jusqu’au branchement API."
      />

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
          label="Livraisons en cours"
          value={livraisonsAPlanifier}
          hint="Planifiées ou à assigner"
          tone="cyan"
          to="/vendeuse/livraisons"
        />
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">Raccourcis</h2>
        <span className="text-xs text-neutral-500">{promosActives} promo(s) active(s)</span>
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

      <h2 className="mb-4 text-lg font-bold text-white">Activité récente</h2>
      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Référence</th>
              <th className="px-4 py-3 font-semibold">Détail</th>
              <th className="px-4 py-3 font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {recent.map((row) => (
              <tr key={row.id + row.type} className="bg-[#0c0c0c] hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <span
                    className={
                      row.type === 'Réservation'
                        ? 'text-reserve-purple'
                        : 'text-tiktok-pink'
                    }
                  >
                    {row.type}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-300">{row.label}</td>
                <td className="px-4 py-3 text-neutral-400">{row.detail}</td>
                <td className="px-4 py-3 text-neutral-500">{fmt(row.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendeuseDashboardPage;
