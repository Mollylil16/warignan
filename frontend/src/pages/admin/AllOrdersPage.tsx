import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { useOrdersList } from '../../hooks/useOrders';
import { useReservationsList } from '../../hooks/useReservations';
import { useDebounce } from '../../hooks/useDebounce';
import { formatPrice } from '../../utils/formatPrice';
import { downloadOrdersCsv } from '../../utils/ordersCsvExport';
import { OrderItemsList } from '../../components/orders/OrderItemsList';
import type { StaffOrderRow } from '../../hooks/useOrders';

const stepLabel: Record<string, string> = {
  preparation: 'Préparation',
  emballage: 'Emballage',
  expediee: 'Expédiée',
  livree: 'Livrée',
};

const workflowLabel: Record<string, string> = {
  awaiting_deposit: 'Acompte',
  awaiting_validation: 'À valider',
  validated: 'Validée',
  cancelled: 'Annulée',
};

const AllOrdersPage = () => {
  const [qOrders, setQOrders] = useState('');
  const [qReservations, setQReservations] = useState('');
  const debouncedQOrders = useDebounce(qOrders, 300);
  const debouncedQReservations = useDebounce(qReservations, 300);

  const { data: orders = [], isPending: lo, error: eo } = useOrdersList({ q: debouncedQOrders || undefined });
  const { data: reservations = [], isPending: lr, error: er } = useReservationsList();

  const filteredReservations = debouncedQReservations
    ? reservations.filter(
        (r) =>
          r.reference.toLowerCase().includes(debouncedQReservations.toLowerCase()) ||
          r.clientName.toLowerCase().includes(debouncedQReservations.toLowerCase())
      )
    : reservations;

  return (
    <div className="max-w-6xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Toutes les commandes</h1>
      <p className="mb-8 text-sm text-neutral-500">Données live depuis l'API (rôle admin).</p>

      {(eo || er) && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {String(eo || er)}
        </p>
      )}

      {/* Commandes */}
      <section className="mb-10">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-tiktok-pink">
            Commandes
            <span className="ml-2 font-mono text-neutral-500">
              {lo ? '…' : orders.length}
            </span>
          </h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" strokeWidth={2} aria-hidden />
              <input
                value={qOrders}
                onChange={(e) => setQOrders(e.target.value)}
                placeholder="Recherche…"
                className="h-9 w-44 rounded-lg border border-white/10 bg-[#111] pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-pink/40 focus:outline-none sm:w-56"
              />
            </div>
            <button
              type="button"
              disabled={orders.length === 0}
              onClick={() => {
                const stamp = new Date().toISOString().slice(0, 10);
                downloadOrdersCsv(orders as StaffOrderRow[], `admin-commandes-${stamp}`);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-300 hover:bg-white/10 disabled:opacity-40"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
              CSV
            </button>
          </div>
        </div>

        {lo ? (
          <div className="overflow-hidden rounded-xl border border-white/10">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex animate-pulse gap-4 border-b border-white/5 bg-[#111] px-4 py-3">
                <div className="h-4 w-32 rounded bg-white/5" />
                <div className="h-4 w-24 rounded bg-white/5" />
                <div className="h-4 w-16 rounded bg-white/5" />
                <div className="ml-auto h-4 w-20 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-[#141414] text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Articles</th>
                  <th className="px-4 py-3 font-semibold">Ville</th>
                  <th className="px-4 py-3 font-semibold">Étape</th>
                  <th className="px-4 py-3 font-semibold">Paiement</th>
                  <th className="px-4 py-3 font-semibold text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#111]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-sm text-neutral-600">
                      Aucune commande trouvée.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="text-neutral-300 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-tiktok-pink">{o.reference}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{o.clientName}</div>
                        {o.clientPhone && (
                          <a
                            href={`tel:${o.clientPhone}`}
                            className="block font-mono text-xs text-tiktok-cyan hover:underline"
                          >
                            {o.clientPhone}
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <OrderItemsList items={o.items} summary={o.itemsSummary} variant="compact" />
                      </td>
                      <td className="px-4 py-3">{o.city}</td>
                      <td className="px-4 py-3">{stepLabel[o.step] ?? o.step}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            o.paymentStatus === 'full'
                              ? 'bg-status-green/20 text-status-green'
                              : o.paymentStatus === 'partial'
                              ? 'bg-amber-500/20 text-amber-200'
                              : 'bg-white/10 text-neutral-500'
                          }`}
                        >
                          {o.paymentStatus === 'full' ? 'Soldé' : o.paymentStatus === 'partial' ? 'Partiel' : 'Impayé'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">
                        {formatPrice(o.totalFcfa)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Réservations */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-reserve-purple">
            Réservations
            <span className="ml-2 font-mono text-neutral-500">
              {lr ? '…' : filteredReservations.length}
            </span>
          </h2>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" strokeWidth={2} aria-hidden />
            <input
              value={qReservations}
              onChange={(e) => setQReservations(e.target.value)}
              placeholder="Recherche…"
              className="h-9 w-44 rounded-lg border border-white/10 bg-[#111] pl-9 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-reserve-purple/40 focus:outline-none sm:w-56"
            />
          </div>
        </div>

        {lr ? (
          <div className="overflow-hidden rounded-xl border border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex animate-pulse gap-4 border-b border-white/5 bg-[#111] px-4 py-3">
                <div className="h-4 w-32 rounded bg-white/5" />
                <div className="h-4 w-24 rounded bg-white/5" />
                <div className="ml-auto h-4 w-20 rounded bg-white/5" />
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-white/10 bg-[#141414] text-xs uppercase text-neutral-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Référence</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Articles</th>
                  <th className="px-4 py-3 font-semibold">État</th>
                  <th className="px-4 py-3 font-semibold">Acompte</th>
                  <th className="px-4 py-3 font-semibold text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#111]">
                {filteredReservations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-neutral-600">
                      Aucune réservation trouvée.
                    </td>
                  </tr>
                ) : (
                  filteredReservations.map((r) => (
                    <tr key={r.id} className="text-neutral-300 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono text-xs text-reserve-purple">{r.reference}</td>
                      <td className="px-4 py-3 text-white">{r.clientName}</td>
                      <td className="px-4 py-3">
                        <OrderItemsList items={r.items} summary={r.productsSummary} variant="compact" />
                      </td>
                      <td className="px-4 py-3 text-xs">{workflowLabel[r.workflow] ?? r.workflow}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            r.depositStatus === 'paid'
                              ? 'bg-status-green/20 text-status-green'
                              : 'bg-white/10 text-neutral-500'
                          }`}
                        >
                          {r.depositStatus === 'paid' ? 'Payé' : 'En attente'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-white">
                        {formatPrice(r.totalFcfa)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default AllOrdersPage;
