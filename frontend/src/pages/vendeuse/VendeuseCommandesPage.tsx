import { type FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy, Filter, X } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import type { OrderStep } from '../../types/domain';
import { useOrdersList, type StaffOrderRow } from '../../hooks/useOrders';
import { api, apiErrorMessage } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

const steps: OrderStep[] = ['preparation', 'emballage', 'expediee', 'livree'];

const stepLabel: Record<OrderStep, string> = {
  preparation: 'Préparation',
  emballage: 'Emballage',
  expediee: 'Expédiée',
  livree: 'Livrée',
};

const VendeuseCommandesPage = () => {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQ = searchParams.get('q')?.trim() || '';
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!searchParams.has('q')) return;
    setQ(searchParams.get('q') ?? '');
  }, [searchParams]);
  const [stepFilter, setStepFilter] = useState<OrderStep | ''>('');
  const [city, setCity] = useState('');
  const [fromISO, setFromISO] = useState('');
  const [toISO, setToISO] = useState('');
  const [minTotal, setMinTotal] = useState('');
  const [maxTotal, setMaxTotal] = useState('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [drawerId, setDrawerId] = useState<string | null>(null);

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      step: stepFilter || undefined,
      city: city.trim() || undefined,
      fromISO: fromISO || undefined,
      toISO: toISO || undefined,
      minTotalFcfa: minTotal.trim() ? Number(minTotal) : undefined,
      maxTotalFcfa: maxTotal.trim() ? Number(maxTotal) : undefined,
    }),
    [q, stepFilter, city, fromISO, toISO, minTotal, maxTotal]
  );

  const { data: orders = [], isPending, error, refetch } = useOrdersList(params);

  const patchStep = useMutation({
    mutationFn: async ({ id, step }: { id: string; step: OrderStep }) => {
      await api.patch(`/orders/${id}/step`, { step });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });

  const bulkStep = useMutation({
    mutationFn: async ({ ids, step }: { ids: string[]; step: OrderStep }) => {
      await api.post('/orders/bulk-step', { ids, step });
    },
    onSuccess: () => {
      setSelected({});
      void qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });

  const setStep = (id: string, step: OrderStep) => patchStep.mutate({ id, step });

  const advance = (id: string, current: OrderStep) => {
    const i = steps.indexOf(current);
    if (i < steps.length - 1) patchStep.mutate({ id, step: steps[i + 1] });
  };

  const asStep = (s: string): OrderStep =>
    steps.includes(s as OrderStep) ? (s as OrderStep) : 'preparation';

  const orderFullyPaid = (o: StaffOrderRow) => o.paymentStatus === 'full';

  const selectableStepsFor = (o: StaffOrderRow): OrderStep[] =>
    orderFullyPaid(o)
      ? steps
      : asStep(o.step) === 'preparation'
        ? ['preparation']
        : ['preparation', asStep(o.step)];

  const canAdvanceOrder = (o: StaffOrderRow) =>
    asStep(o.step) !== 'livree' && orderFullyPaid(o);

  const selectedIds = Object.entries(selected)
    .filter(([, v]) => v)
    .map(([id]) => id);

  const selectedRows = useMemo(
    () =>
      selectedIds
        .map((id) => (orders as StaffOrderRow[]).find((x) => x.id === id))
        .filter((x): x is StaffOrderRow => Boolean(x)),
    [selectedIds, orders]
  );
  const bulkBlockShipment = selectedRows.some((o) => !orderFullyPaid(o));

  const openDrawer = (id: string) => setDrawerId(id);
  const drawerOrder = (orders as StaffOrderRow[]).find((o) => o.id === drawerId) ?? null;

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      window.prompt('Copie :', txt);
    }
  };

  const clearFilters = () => {
    setQ('');
    setStepFilter('');
    setCity('');
    setFromISO('');
    setToISO('');
    setMinTotal('');
    setMaxTotal('');
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('q');
        return next;
      },
      { replace: true }
    );
  };

  const handleFilterSubmit = (e: FormEvent) => {
    e.preventDefault();
    void refetch();
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Commandes"
        description="Les paiements Wave / Orange Money / manuels sont cumulés par référence. Emballage et expédition ne sont possibles qu’une fois le total commande entièrement encaissé (anti-paiement partiel malveillant)."
      />

      {urlQ && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-neutral-400">
          <span>
            Recherche : <span className="font-mono text-tiktok-cyan">{urlQ}</span>
          </span>
          <Link to="/vendeuse/commandes" className="text-tiktok-pink underline-offset-2 hover:underline">
            Tout afficher
          </Link>
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          Impossible de charger les commandes. Vérifie que l’API tourne ({String(error)}).
        </p>
      )}

      {isPending && <p className="text-sm text-neutral-500">Chargement…</p>}

      {patchStep.isError && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {apiErrorMessage(patchStep.error, 'Changement d’étape refusé par le serveur.')}
        </p>
      )}

      <form
        onSubmit={handleFilterSubmit}
        className="mb-6 rounded-xl border border-white/10 bg-[#111] p-4"
      >
        <div className="mb-3 flex items-center justify-between">
          <p className="flex items-center gap-2 text-sm font-semibold text-white">
            <Filter className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
            Filtres
          </p>
          <button
            type="button"
            onClick={clearFilters}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            Réinitialiser
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white lg:col-span-2"
            placeholder="Recherche (ref, nom, ville, contenu)…"
          />
          <select
            value={stepFilter}
            onChange={(e) => setStepFilter(e.target.value as OrderStep | '')}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Toutes étapes</option>
            {steps.map((s) => (
              <option key={s} value={s}>
                {stepLabel[s]}
              </option>
            ))}
          </select>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            placeholder="Ville"
          />
          <input
            value={fromISO}
            onChange={(e) => setFromISO(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            placeholder="Du (YYYY-MM-DD)"
          />
          <input
            value={toISO}
            onChange={(e) => setToISO(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            placeholder="Au (YYYY-MM-DD)"
          />
          <input
            value={minTotal}
            onChange={(e) => setMinTotal(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            placeholder="Min total"
          />
          <input
            value={maxTotal}
            onChange={(e) => setMaxTotal(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            placeholder="Max total"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button
            type="submit"
            className="rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
          >
            Appliquer
          </button>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-neutral-500">
              {selectedIds.length} sélectionnée(s)
            </span>
            <button
              type="button"
              disabled={selectedIds.length === 0 || bulkStep.isPending || bulkBlockShipment}
              title={
                bulkBlockShipment
                  ? 'Sélection : au moins une commande sans paiement intégral'
                  : undefined
              }
              onClick={() => bulkStep.mutate({ ids: selectedIds, step: 'emballage' })}
              className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white disabled:opacity-40"
            >
              Passer en emballage
            </button>
            <button
              type="button"
              disabled={selectedIds.length === 0 || bulkStep.isPending || bulkBlockShipment}
              title={
                bulkBlockShipment
                  ? 'Sélection : au moins une commande sans paiement intégral'
                  : undefined
              }
              onClick={() => bulkStep.mutate({ ids: selectedIds, step: 'expediee' })}
              className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white disabled:opacity-40"
            >
              Passer en expédiée
            </button>
          </div>
        </div>
        {bulkStep.error && (
          <p className="mt-2 text-xs text-red-400">
            {apiErrorMessage(bulkStep.error, 'Impossible de modifier en lot.')}
          </p>
        )}
      </form>

      <div className="space-y-6">
        {(orders as StaffOrderRow[]).map((o) => {
          const step = asStep(o.step);
          return (
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
                  <div className="mt-1 space-y-1">
                    {o.paymentStatus === 'full' && (
                      <span className="inline-block rounded-full bg-status-green/20 px-2 py-0.5 text-[10px] font-bold uppercase text-status-green">
                        Total encaissé
                      </span>
                    )}
                    {o.paymentStatus === 'partial' && (
                      <span className="inline-block rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-200">
                        Paiement partiel
                      </span>
                    )}
                    {o.paymentStatus === 'unpaid' && (
                      <span className="inline-block rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-neutral-500">
                        Aucun paiement confirmé
                      </span>
                    )}
                    <p className="text-xs text-neutral-400">
                      Encaissé :{' '}
                      <span className="font-semibold text-white">{formatPrice(o.paidFcfaConfirmed)}</span>
                      {' — '}Reste :{' '}
                      <span className="font-semibold text-tiktok-pink">{formatPrice(o.balanceDueFcfa)}</span>
                    </p>
                    <p className="text-[11px] text-neutral-600">
                      {o.paymentStatus !== 'full'
                        ? 'Emballage / expédition bloqués sans solde complet.'
                        : o.paidAt
                          ? `Solde atteint le ${new Date(o.paidAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}`
                          : 'Solde complet — logistique débloquée.'}
                    </p>
                  </div>
                </div>
              </div>

              <p className="mb-4 text-sm text-neutral-400">{o.itemsSummary}</p>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  <input
                    type="checkbox"
                    checked={Boolean(selected[o.id])}
                    onChange={(e) => setSelected((s) => ({ ...s, [o.id]: e.target.checked }))}
                    className="h-4 w-4 accent-tiktok-pink"
                  />
                  Sélectionner
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void copy(o.reference)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    Copier ref
                  </button>
                  <button
                    type="button"
                    onClick={() => openDrawer(o.id)}
                    className="rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/15"
                  >
                    Détail
                  </button>
                </div>
              </div>

              <div className="mb-4 flex flex-wrap gap-2">
                {steps.map((s, idx) => {
                  const active = steps.indexOf(step) >= idx;
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
                    value={step}
                    disabled={patchStep.isPending}
                    onChange={(e) => setStep(o.id, e.target.value as OrderStep)}
                    className="rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-tiktok-pink/50 focus:outline-none"
                  >
                    {selectableStepsFor(o).map((s) => (
                      <option key={s} value={s}>
                        {stepLabel[s]}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => advance(o.id, step)}
                  disabled={!canAdvanceOrder(o) || patchStep.isPending}
                  title={
                    !canAdvanceOrder(o)
                      ? 'Paiement intégral requis avant emballage / expédition'
                      : undefined
                  }
                  className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Étape suivante
                </button>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-400 hover:text-white"
                >
                  Actualiser
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {drawerOrder && (
        <div className="fixed inset-0 z-[300] flex items-end justify-center bg-black/60 p-4 sm:items-center">
          <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b0b0b] p-5 text-white shadow-2xl">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm text-tiktok-cyan">{drawerOrder.reference}</p>
                <p className="text-lg font-bold">{drawerOrder.clientName}</p>
                <p className="text-sm text-neutral-500">{drawerOrder.city}</p>
              </div>
              <button
                type="button"
                onClick={() => setDrawerId(null)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            <p className="mb-4 text-sm text-neutral-300">{drawerOrder.itemsSummary}</p>
            <div className="mb-4 grid gap-2 rounded-xl border border-white/10 bg-[#111] p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Total</span>
                <span className="font-semibold text-white">{formatPrice(drawerOrder.totalFcfa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Encaissé (confirmé)</span>
                <span className="font-semibold text-tiktok-cyan">
                  {formatPrice(drawerOrder.paidFcfaConfirmed)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Reste dû</span>
                <span className="font-semibold text-tiktok-pink">{formatPrice(drawerOrder.balanceDueFcfa)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Étape</span>
                <span className="font-semibold text-white">{stepLabel[asStep(drawerOrder.step)]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Créée</span>
                <span className="font-semibold text-white">
                  {new Date(drawerOrder.createdAt).toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void copy(drawerOrder.reference)}
                className="inline-flex items-center gap-2 rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-semibold text-white hover:brightness-110"
              >
                <Copy className="h-4 w-4" strokeWidth={2} aria-hidden />
                Copier la référence
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelected((s) => ({ ...s, [drawerOrder.id]: true }));
                  setDrawerId(null);
                }}
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-200 hover:bg-white/5"
              >
                Ajouter à la sélection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendeuseCommandesPage;
