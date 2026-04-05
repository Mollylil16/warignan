import { useState } from 'react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { mockOrders, type MockOrder, type OrderStep } from '../../data/vendeuseMock';
import { formatPrice } from '../../utils/formatPrice';

const steps: OrderStep[] = ['preparation', 'emballage', 'expediee', 'livree'];

const stepLabel: Record<OrderStep, string> = {
  preparation: 'Préparation',
  emballage: 'Emballage',
  expediee: 'Expédiée',
  livree: 'Livrée',
};

const VendeuseCommandesPage = () => {
  const [orders, setOrders] = useState<MockOrder[]>(() => [...mockOrders]);

  const setStep = (id: string, step: OrderStep) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, step } : o)));
  };

  const advance = (id: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const i = steps.indexOf(o.step);
        if (i < steps.length - 1) return { ...o, step: steps[i + 1] };
        return o;
      })
    );
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Commandes"
        description="Pipeline préparation → emballage → expédition → livraison confirmée. Sélecteur manuel ou bouton « Étape suivante »."
      />

      <div className="space-y-6">
        {orders.map((o) => (
          <article
            key={o.id}
            className="rounded-xl border border-white/10 bg-[#111] p-5 sm:p-6"
          >
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-sm text-tiktok-cyan">{o.reference}</p>
                <p className="text-lg font-bold text-white">{o.clientName}</p>
                <p className="text-sm text-neutral-500">{o.city}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-tiktok-pink">{formatPrice(o.totalFcfa)}</p>
                <p className="text-xs text-neutral-500">
                  Payé le{' '}
                  {new Date(o.paidAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </p>
              </div>
            </div>

            <p className="mb-4 text-sm text-neutral-400">{o.itemsSummary}</p>

            <div className="mb-4 flex flex-wrap gap-2">
              {steps.map((s, idx) => {
                const active = steps.indexOf(o.step) >= idx;
                return (
                  <div key={s} className="flex items-center gap-2">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                        active
                          ? 'bg-tiktok-pink text-white'
                          : 'border border-white/20 text-neutral-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className={active ? 'text-white' : 'text-neutral-600'}>
                      {stepLabel[s]}
                    </span>
                    {idx < steps.length - 1 && (
                      <span className="mx-1 text-neutral-600">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-4">
              <label className="flex items-center gap-2 text-sm text-neutral-400">
                <span>Étape :</span>
                <select
                  value={o.step}
                  onChange={(e) => setStep(o.id, e.target.value as OrderStep)}
                  className="rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-tiktok-pink/50 focus:outline-none"
                >
                  {steps.map((s) => (
                    <option key={s} value={s}>
                      {stepLabel[s]}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={() => advance(o.id)}
                disabled={o.step === 'livree'}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Étape suivante
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-400 hover:text-white"
              >
                Imprimer bordereau (bientôt)
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default VendeuseCommandesPage;
