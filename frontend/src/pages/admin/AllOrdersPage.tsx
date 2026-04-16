import { useOrdersList } from '../../hooks/useOrders';
import { useReservationsList } from '../../hooks/useReservations';
import { formatPrice } from '../../utils/formatPrice';

const AllOrdersPage = () => {
  const { data: orders = [], isPending: lo, error: eo } = useOrdersList();
  const { data: reservations = [], isPending: lr, error: er } = useReservationsList();

  return (
    <div className="max-w-6xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Toutes les commandes</h1>
      <p className="mb-8 text-sm text-neutral-500">Données live depuis l’API (rôle admin).</p>

      {(eo || er) && (
        <p className="mb-4 text-sm text-red-300">{String(eo || er)}</p>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-tiktok-pink">
          Commandes {lo && '(chargement…)'}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#141414] text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Référence</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Ville</th>
                <th className="px-4 py-3 font-semibold">Étape</th>
                <th className="px-4 py-3 font-semibold text-right">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#111]">
              {orders.map((o) => (
                <tr key={o.id} className="text-neutral-300">
                  <td className="px-4 py-3 font-mono text-tiktok-cyan">{o.reference}</td>
                  <td className="px-4 py-3 text-white">{o.clientName}</td>
                  <td className="px-4 py-3">{o.city}</td>
                  <td className="px-4 py-3 capitalize">{o.step}</td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatPrice(o.totalFcfa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-reserve-purple">
          Réservations {lr && '(chargement…)'}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-white/10 bg-[#141414] text-xs uppercase text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Référence</th>
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Workflow</th>
                <th className="px-4 py-3 font-semibold">Acompte</th>
                <th className="px-4 py-3 font-semibold text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 bg-[#111]">
              {reservations.map((r) => (
                <tr key={r.id} className="text-neutral-300">
                  <td className="px-4 py-3 font-mono text-reserve-purple">{r.reference}</td>
                  <td className="px-4 py-3 text-white">{r.clientName}</td>
                  <td className="px-4 py-3 capitalize">{r.workflow.replace(/_/g, ' ')}</td>
                  <td className="px-4 py-3">{r.depositStatus}</td>
                  <td className="px-4 py-3 text-right font-semibold text-white">
                    {formatPrice(r.totalFcfa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AllOrdersPage;
