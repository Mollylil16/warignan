import { type FormEvent, useState } from 'react';
import PageHeader from '../../components/vendeuse/PageHeader';
import {
  usePromotionsList,
  usePromotionMutations,
  usePromotionStats,
  type PromotionRow,
} from '../../hooks/usePromotions';
import type { PromotionTypeApi } from '../../types/domain';
import { formatPrice } from '../../utils/formatPrice';

const VendeusePromotionsPage = () => {
  const { data: promos = [], isPending, error, refetch } = usePromotionsList();
  const { data: stats = [] } = usePromotionStats();
  const { create, patch, remove } = usePromotionMutations();

  const [showForm, setShowForm] = useState(false);
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [type, setType] = useState<PromotionTypeApi>('percent');
  const [value, setValue] = useState(10);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const toggle = (p: PromotionRow) => {
    patch.mutate({ id: p.id, body: { active: !p.active } });
  };

  const addPromo = (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !start || !end) return;
    create.mutate(
      {
        code: code.trim(),
        label: label.trim() || code.trim(),
        type,
        value,
        startDate: start,
        endDate: end,
        active: true,
      },
      {
        onSuccess: () => {
          setCode('');
          setLabel('');
          setValue(10);
          setStart('');
          setEnd('');
          setShowForm(false);
        },
      }
    );
  };

  const formatValue = (p: PromotionRow) =>
    p.type === 'percent' ? `${p.value} %` : formatPrice(p.value);

  const cloneNextWeek = (p: PromotionRow) => {
    const startDate = p.startDate;
    const endDate = p.endDate;
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const end = new Date(`${endDate}T00:00:00.000Z`);
    const shiftDays = 7;
    start.setDate(start.getDate() + shiftDays);
    end.setDate(end.getDate() + shiftDays);
    const iso = (d: Date) => d.toISOString().slice(0, 10);
    create.mutate({
      code: `${p.code}-N`,
      label: p.label,
      type: p.type,
      value: p.value,
      startDate: iso(start),
      endDate: iso(end),
      active: true,
    });
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Réductions & promotions"
        description="Codes promo enregistrés sur le serveur. Les codes actifs s’affichent automatiquement côté boutique."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5"
            >
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              {showForm ? 'Fermer' : 'Nouvelle promo'}
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {String(error)}
        </p>
      )}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.slice(0, 3).map((s) => (
          <div key={s.id} className="rounded-xl border border-white/10 bg-[#111] p-5">
            <p className="font-mono text-xs font-bold text-tiktok-cyan">{s.code}</p>
            <p className="mt-1 text-sm font-semibold text-white">{s.label}</p>
            <p className="mt-3 text-xs text-neutral-500">Utilisations</p>
            <p className="text-2xl font-bold text-white">{s.uses}</p>
            <p className="mt-2 text-xs text-neutral-500">Remises cumulées</p>
            <p className="text-lg font-bold text-tiktok-pink">{formatPrice(s.discountFcfa)}</p>
            {s.warnings.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs text-amber-200">
                {s.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

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
              onChange={(e) => setType(e.target.value as PromotionTypeApi)}
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
              disabled={create.isPending}
              className="rounded-lg bg-reserve-purple px-6 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
            >
              {create.isPending ? 'Enregistrement…' : 'Créer sur le serveur'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Libellé</th>
              <th className="px-4 py-3 font-semibold">Réduction</th>
              <th className="px-4 py-3 font-semibold">Période</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
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
                    disabled={patch.isPending}
                    onClick={() => toggle(p)}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      p.active
                        ? 'bg-status-green/20 text-status-green'
                        : 'bg-neutral-800 text-neutral-500'
                    }`}
                  >
                    {p.active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={create.isPending}
                    onClick={() => cloneNextWeek(p)}
                    className="mr-4 text-xs text-neutral-300 hover:underline"
                    title="Duplique la promo avec dates +7 jours (code suffixé -N)"
                  >
                    Cloner
                  </button>
                  <button
                    type="button"
                    disabled={remove.isPending}
                    onClick={() => {
                      if (window.confirm(`Supprimer la promo ${p.code} ?`)) remove.mutate(p.id);
                    }}
                    className="text-xs text-red-400 hover:underline"
                  >
                    Supprimer
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
