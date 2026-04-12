import { Link } from 'react-router-dom';
import { Package, Percent, Truck, UserCheck } from 'lucide-react';
import {
  mockDeliveries,
  mockOrders,
  mockPromotions,
  mockReservations,
} from '../../data/vendeuseMock';
import { formatPrice } from '../../utils/formatPrice';

const StatsPage = () => {
  const caCommandes = mockOrders.reduce((s, o) => s + o.totalFcfa, 0);
  const caResa = mockReservations.reduce((s, r) => s + r.totalFcfa, 0);
  const livraisonsActives = mockDeliveries.filter((d) => d.status !== 'done').length;
  const promos = mockPromotions.filter((p) => p.active).length;

  const cards = [
    {
      label: 'Commandes (mock)',
      value: mockOrders.length,
      sub: formatPrice(caCommandes),
      icon: Package,
      color: 'text-tiktok-pink',
    },
    {
      label: 'Réservations (mock)',
      value: mockReservations.length,
      sub: formatPrice(caResa),
      icon: UserCheck,
      color: 'text-reserve-purple',
    },
    {
      label: 'Livraisons en cours',
      value: livraisonsActives,
      sub: `${mockDeliveries.length} au total`,
      icon: Truck,
      color: 'text-tiktok-cyan',
    },
    {
      label: 'Promos actives',
      value: promos,
      sub: 'Codes marketing',
      icon: Percent,
      color: 'text-amber-400',
    },
  ];

  return (
    <div className="max-w-5xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Tableau de bord</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Vue synthétique sur les données de démo. Les chiffres seront alimentés par l’API backend.
      </p>

      <div className="mb-10 grid gap-4 sm:grid-cols-2">
        {cards.map(({ label, value, sub, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-neutral-400">{label}</span>
              <Icon className={`h-5 w-5 shrink-0 ${color}`} strokeWidth={2} aria-hidden />
            </div>
            <p className="text-3xl font-bold text-white">{value}</p>
            <p className="mt-1 text-xs text-neutral-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6">
        <h2 className="mb-3 text-sm font-semibold text-white">Raccourcis</h2>
        <ul className="flex flex-wrap gap-3 text-sm">
          <li>
            <Link
              to="/admin/commandes"
              className="text-tiktok-cyan underline-offset-2 hover:underline"
            >
              Liste des commandes
            </Link>
          </li>
          <li>
            <Link
              to="/vendeuse"
              className="text-tiktok-cyan underline-offset-2 hover:underline"
            >
              Espace vendeuse
            </Link>
          </li>
          <li>
            <Link
              to="/livreur"
              className="text-tiktok-cyan underline-offset-2 hover:underline"
            >
              Vue livreur
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default StatsPage;
