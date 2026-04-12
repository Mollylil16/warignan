import { mockOrders, mockReservations } from '../../data/vendeuseMock';
import { formatPrice } from '../../utils/formatPrice';

const AllOrdersPage = () => {
  return (
    <div className="max-w-6xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Toutes les commandes</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Agrégat démo : commandes payées et réservations. Tri et pagination arriveront avec l’API.
      </p>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-tiktok-pink">
          Commandes
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
              {mockOrders.map((o) => (
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
          Réservations
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
              {mockReservations.map((r) => (
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
