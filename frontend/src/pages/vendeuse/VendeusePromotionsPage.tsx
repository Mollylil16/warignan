import { useState, type FormEvent } from 'react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { mockPromotions, type MockPromotion } from '../../data/vendeuseMock';
import { formatPrice } from '../../utils/formatPrice';

const VendeusePromotionsPage = () => {
  const [promos, setPromos] = useState<MockPromotion[]>(() => [...mockPromotions]);
  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<'percent' | 'fixed'>('percent');
  const [value, setValue] = useState(10);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const toggle = (id: string) => {
    setPromos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: !p.active } : p))
    );
  };

  const addPromo = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !start || !end) return;
    const id = `p-${Date.now()}`;
    setPromos((prev) => [
      {
        id,
        code: code.trim().toUpperCase(),
        label: label.trim() || code.trim(),
        type,
        value,
        startDate: start,
        endDate: end,
        active: true,
      },
      ...prev,
    ]);
    setCode('');
    setLabel('');
    setValue(10);
    setStart('');
    setEnd('');
    setShowForm(false);
  };

  const formatValue = (p: MockPromotion) =>
    p.type === 'percent' ? `${p.value} %` : formatPrice(p.value);

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Réductions & promotions"
        description="Codes promo, remises en pourcentage ou montant fixe, dates de validité. Activation / désactivation immédiate (état local)."
        actions={
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          >
            {showForm ? 'Fermer le formulaire' : 'Nouvelle promo'}
          </button>
        }
      />

      {showForm && (
        <form
          onSubmit={addPromo}
          className="mb-8 grid gap-4 rounded-xl border border-white/10 bg-[#111] p-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="ex. WARI15"
              className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-pink/50 focus:outline-none"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Libellé</label>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Description courte"
              className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-pink/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as 'percent' | 'fixed')}
              className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
            >
              <option value="percent">Pourcentage</option>
              <option value="fixed">Montant fixe (FCFA)</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Valeur</label>
            <input
              type="number"
              min={1}
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-tiktok-pink/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Début</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              required
              className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Fin</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              required
              className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex items-end sm:col-span-2 lg:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-reserve-purple px-6 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              Enregistrer (local)
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Libellé</th>
              <th className="px-4 py-3 font-semibold">Réduction</th>
              <th className="px-4 py-3 font-semibold">Période</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {promos.map((p) => (
              <tr key={p.id} className="bg-[#0c0c0c] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono font-bold text-tiktok-cyan">{p.code}</td>
                <td className="px-4 py-3 text-neutral-300">{p.label}</td>
                <td className="px-4 py-3 font-semibold text-white">{formatValue(p)}</td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {p.startDate} → {p.endDate}
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      p.active
                        ? 'bg-status-green/20 text-status-green'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendeusePromotionsPage;
