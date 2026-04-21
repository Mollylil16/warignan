import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Copy } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import type { DepositStatus, ReservationWorkflow } from '../../types/domain';
import { useReservationsList, type StaffReservationRow } from '../../hooks/useReservations';
import { api } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

const depositLabel: Record<DepositStatus, string> = {
  pending: 'Acompte en attente',
  paid: 'Acompte reçu',
  failed: 'Échec paiement',
};

const workflowLabel: Record<ReservationWorkflow, string> = {
  awaiting_deposit: 'En attente d’acompte',
  awaiting_validation: 'À valider',
  validated: 'Validée',
  cancelled: 'Annulée',
};

function pillDeposit(s: DepositStatus) {
  if (s === 'paid') return 'bg-status-green/15 text-status-green border-status-green/30';
  if (s === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/30';
  return 'bg-status-orange/15 text-status-orange border-status-orange/30';
}

function pillWorkflow(w: ReservationWorkflow) {
  if (w === 'validated') return 'bg-tiktok-cyan/10 text-tiktok-cyan border-tiktok-cyan/25';
  if (w === 'cancelled') return 'bg-neutral-600/20 text-neutral-500 border-neutral-600/40';
  if (w === 'awaiting_validation') return 'bg-reserve-purple/15 text-reserve-purple border-reserve-purple/30';
  return 'bg-white/5 text-neutral-400 border-white/10';
}

const VendeuseReservationsPage = () => {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const urlQ = searchParams.get('q')?.trim() || undefined;
  const { data: rows = [], isPending, error, refetch, isFetching } = useReservationsList({ q: urlQ });
  const [filter, setFilter] = useState<'all' | 'action' | 'deposit'>('all');

  const patch = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      await api.patch(`/reservations/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reservations'] }),
  });

  const filtered = useMemo(() => {
    const list = rows as StaffReservationRow[];
    if (filter === 'action') return list.filter((r) => r.workflow === 'awaiting_validation');
    if (filter === 'deposit') return list.filter((r) => r.depositStatus === 'pending');
    return list;
  }, [rows, filter]);

  const asDeposit = (s: string): DepositStatus =>
    s === 'paid' || s === 'failed' ? s : 'pending';
  const asWorkflow = (w: string): ReservationWorkflow =>
    (['awaiting_deposit', 'awaiting_validation', 'validated', 'cancelled'].includes(w)
      ? w
      : 'awaiting_deposit') as ReservationWorkflow;

  const columns: { key: ReservationWorkflow; label: string; hint: string }[] = [
    { key: 'awaiting_deposit', label: 'Acompte', hint: 'En attente de paiement' },
    { key: 'awaiting_validation', label: 'Validation', hint: 'Acompte reçu, à valider' },
    { key: 'validated', label: 'Validées', hint: 'Confirmées' },
    { key: 'cancelled', label: 'Annulées', hint: 'Refus / abandon' },
  ];

  const byCol = useMemo(() => {
    const map = new Map<ReservationWorkflow, StaffReservationRow[]>();
    columns.forEach((c) => map.set(c.key, []));
    (filtered as StaffReservationRow[]).forEach((r) => {
      const k = asWorkflow(r.workflow);
      map.get(k)?.push(r);
    });
    return map;
  }, [filtered]);

  const copy = async (txt: string) => {
    try {
      await navigator.clipboard.writeText(txt);
    } catch {
      window.prompt('Copie :', txt);
    }
  };

  const relanceText = (r: StaffReservationRow) =>
    `Bonjour ${r.clientName}, ton acompte pour la réservation ${r.reference} est toujours en attente. ` +
    `Montant acompte: ${r.depositFcfa} FCFA. Dis-moi quand c’est réglé pour validation.`;

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Réservations"
        description="Données temps réel depuis l’API (acompte, workflow, validation)."
        actions={
          <button
            type="button"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetching ? 'Actualisation…' : 'Actualiser'}
          </button>
        }
      />

      {urlQ && (
        <p className="mb-4 flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[#111] px-3 py-2 text-sm text-neutral-400">
          <span>
            Recherche : <span className="font-mono text-tiktok-cyan">{urlQ}</span>
          </span>
          <Link to="/vendeuse/reservations" className="text-tiktok-pink underline-offset-2 hover:underline">
            Tout afficher
          </Link>
        </p>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          Erreur de chargement : {String(error)}
        </p>
      )}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ['all', 'Toutes'],
            ['action', 'À valider'],
            ['deposit', 'Acompte en attente'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
              filter === key
                ? 'bg-reserve-purple text-white'
                : 'bg-[#111] text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {columns.map((c) => {
          const items = byCol.get(c.key) ?? [];
          return (
            <section
              key={c.key}
              className="min-h-[40vh] rounded-xl border border-white/10 bg-[#0c0c0c]"
            >
              <header className="border-b border-white/10 bg-[#111] px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold text-white">{c.label}</p>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-neutral-400">
                    {items.length}
                  </span>
                </div>
                <p className="mt-1 text-xs text-neutral-500">{c.hint}</p>
                {c.key === 'awaiting_validation' && (
                  <p className="mt-2 text-[11px] text-neutral-600">
                    Règle : <span className="text-neutral-400">acompte requis</span> pour valider.
                  </p>
                )}
              </header>
              <ul className="space-y-3 p-4">
                {items.map((r) => {
                  const ds = asDeposit(r.depositStatus);
                  const wf = asWorkflow(r.workflow);
                  return (
                    <li
                      key={r.id}
                      className="rounded-xl border border-white/10 bg-[#111] p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-mono text-xs text-tiktok-cyan">{r.reference}</p>
                          <p className="truncate text-sm font-semibold text-white">{r.clientName}</p>
                          <p className="truncate text-xs text-neutral-500">{r.clientPhone}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => void copy(r.reference)}
                          className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-2.5 py-1 text-[11px] font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
                        >
                          <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                          Ref
                        </button>
                      </div>

                      <p className="mb-3 line-clamp-2 text-xs text-neutral-400">{r.productsSummary}</p>

                      <div className="mb-3 grid gap-1 text-xs text-neutral-400">
                        <div className="flex justify-between">
                          <span>Total</span>
                          <span className="font-semibold text-white">{formatPrice(r.totalFcfa)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Acompte</span>
                          <span className="font-semibold text-white">{formatPrice(r.depositFcfa)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Encaissé (Wave / OM)</span>
                          <span className="font-semibold text-tiktok-cyan">{formatPrice(r.paidFcfaConfirmed)}</span>
                        </div>
                        {r.depositCoverage !== 'full' && (
                          <p className="col-span-2 text-[10px] text-amber-200/90">
                            Manque {formatPrice(r.depositShortfallFcfa)} sur l’acompte — marquer « payé »
                            n’est possible qu’avec le montant complet tracé côté paiements.
                          </p>
                        )}
                      </div>

                      <div className="mb-3 flex flex-wrap gap-2">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pillDeposit(ds)}`}
                        >
                          {depositLabel[ds]}
                        </span>
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pillWorkflow(wf)}`}
                        >
                          {workflowLabel[wf]}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {r.depositStatus === 'pending' && (
                          <button
                            type="button"
                            disabled={patch.isPending || r.depositCoverage !== 'full'}
                            title={
                              r.depositCoverage !== 'full'
                                ? `Encaissements confirmés : ${r.paidFcfaConfirmed} / ${r.depositFcfa} FCFA`
                                : undefined
                            }
                            onClick={() => patch.mutate({ id: r.id, body: { depositStatus: 'paid' } })}
                            className="rounded-lg border border-tiktok-cyan/40 bg-tiktok-cyan/10 px-2.5 py-1.5 text-[11px] font-bold text-tiktok-cyan hover:bg-tiktok-cyan/20 disabled:opacity-50"
                          >
                            Acompte reçu
                          </button>
                        )}
                        {r.workflow === 'awaiting_deposit' && (
                          <button
                            type="button"
                            onClick={() => void copy(relanceText(r))}
                            className="rounded-lg border border-white/15 px-2.5 py-1.5 text-[11px] font-bold text-neutral-300 hover:bg-white/5 hover:text-white"
                          >
                            Copier relance
                          </button>
                        )}
                        {r.workflow === 'awaiting_validation' && (
                          <>
                            <button
                              type="button"
                              disabled={patch.isPending}
                              onClick={() => patch.mutate({ id: r.id, body: { workflow: 'validated' } })}
                              className="rounded-lg bg-status-green/20 px-2.5 py-1.5 text-[11px] font-bold text-status-green hover:bg-status-green/30 disabled:opacity-50"
                            >
                              Valider
                            </button>
                            <button
                              type="button"
                              disabled={patch.isPending}
                              onClick={() => patch.mutate({ id: r.id, body: { workflow: 'cancelled' } })}
                              className="rounded-lg border border-red-500/40 px-2.5 py-1.5 text-[11px] font-bold text-red-400 hover:bg-red-500/10 disabled:opacity-50"
                            >
                              Annuler
                            </button>
                          </>
                        )}
                      </div>
                    </li>
                  );
                })}
                {items.length === 0 && (
                  <li className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-xs text-neutral-600">
                    Aucun élément.
                  </li>
                )}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
};

export default VendeuseReservationsPage;
