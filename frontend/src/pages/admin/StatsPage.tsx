import { Package, Percent, Truck, UserCheck } from 'lucide-react';
import { useDeliveriesList } from '../../hooks/useDeliveries';
import { useOrdersList } from '../../hooks/useOrders';
import { useReservationsList } from '../../hooks/useReservations';
import { useActivePromotionsCount } from '../../hooks/usePromotions';
import { formatPrice } from '../../utils/formatPrice';

const StatsPage = () => {
  const { data: orders = [] } = useOrdersList();
  const { data: reservations = [] } = useReservationsList();
  const { data: deliveries = [] } = useDeliveriesList();
  const { data: promosActives = 0 } = useActivePromotionsCount();

  const caCommandes = orders.reduce((s, o) => s + o.totalFcfa, 0);
  const caResa = reservations.reduce((s, r) => s + r.totalFcfa, 0);
  const livraisonsActives = deliveries.filter((d) => d.status !== 'done').length;

  const cards = [
    {
      label: 'Commandes',
      value: orders.length,
      sub: formatPrice(caCommandes),
      icon: Package,
      color: 'text-tiktok-pink',
    },
    {
      label: 'Réservations',
      value: reservations.length,
      sub: formatPrice(caResa),
      icon: UserCheck,
      color: 'text-reserve-purple',
    },
    {
      label: 'Livraisons en cours',
      value: livraisonsActives,
      sub: `${deliveries.length} au total`,
      icon: Truck,
      color: 'text-tiktok-cyan',
    },
    {
      label: 'Codes promo actifs',
      value: promosActives,
      sub: 'Période de validité en cours',
      icon: Percent,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Tableau de bord</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Chiffres issus de l’API (commandes, réservations, livraisons).
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6"
          >
            <div className="mb-3 flex items-center gap-2">
              <Icon className={`h-5 w-5 ${color}`} strokeWidth={2} aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                {label}
              </span>
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="mt-1 text-sm text-neutral-400">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsPage;
