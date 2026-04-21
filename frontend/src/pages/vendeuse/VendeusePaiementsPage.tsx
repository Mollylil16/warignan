import { type FormEvent, useCallback, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  PlusCircle,
  RefreshCw,
  Search,
  XCircle,
} from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { usePaymentsList, type StaffPaymentEventRow, type StaffPaymentsListResponse } from '../../hooks/usePayments';
import { api, apiErrorMessage } from '../../services/api';
import { downloadStaffPaymentsCsv } from '../../utils/paymentsCsvExport';
import { formatPrice } from '../../utils/formatPrice';

const PAYMENTS_PAGE_SIZES = [25, 50, 100] as const;
const EXPORT_CHUNK = 100;

function statusPill(status: string) {
  if (status === 'confirmed') return 'bg-status-green/15 text-status-green border-status-green/30';
  if (status === 'failed') return 'bg-red-500/10 text-red-400 border-red-500/30';
  return 'bg-status-orange/15 text-status-orange border-status-orange/30';
}

function matchPill(match: boolean) {
  return match
    ? 'bg-tiktok-cyan/10 text-tiktok-cyan border-tiktok-cyan/25'
    : 'bg-amber-500/10 text-amber-300 border-amber-500/25';
}

const VendeusePaiementsPage = () => {
  const [q, setQ] = useState('');
  const [flow, setFlow] = useState('');
  const [provider, setProvider] = useState('');
  const [status, setStatus] = useState('');
  const [filterUnmatched, setFilterUnmatched] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [exporting, setExporting] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [mRef, setMRef] = useState('');
  const [mFlow, setMFlow] = useState<'order' | 'reservation'>('order');
  const [mAmount, setMAmount] = useState(0);
  const [mProvider, setMProvider] = useState<'wave' | 'orange' | 'manual' | 'geniuspay'>('wave');
  const [mStatus, setMStatus] = useState<'confirmed' | 'pending' | 'failed'>('confirmed');
  const [manualErr, setManualErr] = useState<string | null>(null);
  const [manualBusy, setManualBusy] = useState(false);

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      flow: flow || undefined,
      provider: provider || undefined,
      status: status || undefined,
      page,
      limit: pageSize,
    }),
    [q, flow, provider, status, page, pageSize]
  );

  const { data: listPayload, isPending, error, refetch } = usePaymentsList(params);
  const rows = listPayload?.data ?? [];
  const total = listPayload?.total ?? 0;
  const totalPages = listPayload?.totalPages ?? 1;
  const currentPage = listPayload?.page ?? page;

  const filtered = useMemo(() => {
    const list = rows as StaffPaymentEventRow[];
    if (!filterUnmatched) return list;
    return list.filter((r) => !r.match);
  }, [rows, filterUnmatched]);

  const confirmedSum = filtered.reduce(
    (s, r) => s + (r.status === 'confirmed' ? r.amountFcfa : 0),
    0
  );
  const failedCount = filtered.reduce((s, r) => s + (r.status === 'failed' ? 1 : 0), 0);
  const unmatchedCount = filtered.reduce((s, r) => s + (!r.match ? 1 : 0), 0);
  const actionableCount = filtered.reduce(
    (s, r) => s + (!r.match || r.status === 'failed' ? 1 : 0),
    0
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    void refetch();
  };

  const filterParamsForApi = useMemo(
    () => ({
      q: q.trim() || undefined,
      flow: flow || undefined,
      provider: provider || undefined,
      status: status || undefined,
    }),
    [q, flow, provider, status]
  );

  const handleExportCsv = useCallback(async () => {
    setExporting(true);
    try {
      const all: StaffPaymentEventRow[] = [];
      let p = 1;
      let totalPages = 1;
      do {
        const { data } = await api.get<StaffPaymentsListResponse>('/payments', {
          params: { ...filterParamsForApi, page: p, limit: EXPORT_CHUNK },
        });
        all.push(...data.data);
        totalPages = data.totalPages;
        p += 1;
      } while (p <= totalPages);

      let rows = all;
      if (filterUnmatched) {
        rows = rows.filter((r) => !r.match);
      }

      const stamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
      downloadStaffPaymentsCsv(rows, `paiements-${stamp}`);
    } catch (err) {
      window.alert(apiErrorMessage(err, 'Export CSV impossible.'));
    } finally {
      setExporting(false);
    }
  }, [filterParamsForApi, filterUnmatched]);

  const reconcile = async () => {
    try {
      await api.post('/payments/geniuspay/reconcile', { days: 3 });
      void refetch();
      window.alert('Réconciliation GeniusPay lancée (3 jours).');
    } catch (e) {
      window.alert(apiErrorMessage(e, 'Réconciliation impossible.'));
    }
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Paiements"
        description="Événements Wave / Orange Money / manuel. Cumul confirmé et reste sur objectif ; pagination 25–100 lignes ; export CSV des filtres actifs."
        actions={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowManual((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              <PlusCircle className="h-4 w-4" strokeWidth={2} aria-hidden />
              {showManual ? 'Fermer saisie' : 'Saisir un paiement'}
            </button>
            <button
              type="button"
              disabled={exporting || total === 0}
              onClick={() => void handleExportCsv()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
              title="Télécharge tous les événements correspondant aux filtres (recherche, flow, provider, statut). Le filtre « à traiter » du tableau est appliqué à l’export."
            >
              <Download className="h-4 w-4" strokeWidth={2} aria-hidden />
              {exporting ? 'Export…' : 'Exporter CSV'}
            </button>
            <button
              type="button"
              onClick={() => void reconcile()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10"
              title="Récupère les paiements GeniusPay récents et crée les événements manquants (backup si un webhook a été perdu)."
            >
              Réconcilier GeniusPay
            </button>
            <button
              type="button"
              onClick={() => void refetch()}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
              Actualiser
            </button>
          </div>
        }
      />

      {showManual && (
        <div className="mb-6 rounded-xl border border-white/10 bg-[#111] p-4">
          <p className="mb-3 text-sm text-neutral-300">
            Si le paiement Wave/OM ne remonte pas automatiquement, enregistre-le ici à partir d’un screenshot.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setManualErr(null);
              setManualBusy(true);
              try {
                await api.post('/payments', {
                  reference: mRef.trim().toUpperCase(),
                  flow: mFlow,
                  amountFcfa: Number(mAmount),
                  status: mStatus,
                  provider: mProvider,
                });
                setMRef('');
                setMAmount(0);
                setMStatus('confirmed');
                void refetch();
              } catch (err) {
                setManualErr(apiErrorMessage(err, 'Impossible d’enregistrer ce paiement.'));
              } finally {
                setManualBusy(false);
              }
            }}
            className="grid gap-3 rounded-xl border border-white/10 bg-black/30 p-4 sm:grid-cols-2 lg:grid-cols-6"
          >
            <input
              value={mRef}
              onChange={(e) => setMRef(e.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white lg:col-span-2"
              placeholder="Référence (WRG-CMD-… / WRG-RES-…)"
              required
            />
            <select
              value={mFlow}
              onChange={(e) => setMFlow(e.target.value as 'order' | 'reservation')}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            >
              <option value="order">Commande</option>
              <option value="reservation">Réservation</option>
            </select>
            <input
              type="number"
              min={0}
              value={mAmount}
              onChange={(e) => setMAmount(Number(e.target.value))}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
              placeholder="Montant (FCFA)"
              required
            />
            <select
              value={mProvider}
              onChange={(e) => setMProvider(e.target.value as 'wave' | 'orange' | 'manual' | 'geniuspay')}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            >
              <option value="wave">Wave</option>
              <option value="orange">Orange Money</option>
              <option value="manual">Manuel</option>
              <option value="geniuspay">GeniusPay</option>
            </select>
            <select
              value={mStatus}
              onChange={(e) => setMStatus(e.target.value as 'confirmed' | 'pending' | 'failed')}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
            >
              <option value="confirmed">Confirmé</option>
              <option value="pending">Pending</option>
              <option value="failed">Échec</option>
            </select>
            <div className="sm:col-span-2 lg:col-span-6">
              {manualErr && <p className="text-xs text-red-300">{manualErr}</p>}
              <button
                type="submit"
                disabled={manualBusy}
                className="mt-2 rounded-lg bg-reserve-purple px-5 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
              >
                {manualBusy ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          Erreur de chargement : {String(error)}
        </p>
      )}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <form
        onSubmit={handleSubmit}
        className="mb-6 rounded-xl border border-white/10 bg-[#111] p-4"
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterUnmatched(false)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                !filterUnmatched
                  ? 'bg-reserve-purple text-white'
                  : 'bg-[#0a0a0a] text-neutral-500 hover:text-neutral-300'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setFilterUnmatched(true)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${
                filterUnmatched
                  ? 'bg-tiktok-cyan/20 text-tiktok-cyan'
                  : 'bg-[#0a0a0a] text-neutral-500 hover:text-neutral-300'
              }`}
              title="Non rapprochés ou échecs"
            >
              À traiter
              {actionableCount > 0 && (
                <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-black text-white">
                  {actionableCount}
                </span>
              )}
            </button>
          </div>
          <div className="text-xs text-neutral-500">
            Confirmés : <span className="font-semibold text-neutral-300">{formatPrice(confirmedSum)}</span>{' '}
            — Échecs : <span className="font-semibold text-neutral-300">{failedCount}</span>{' '}
            — Non rapprochés : <span className="font-semibold text-neutral-300">{unmatchedCount}</span>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              strokeWidth={2}
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              className="h-10 w-full rounded-lg border border-white/10 bg-black py-2 pl-10 pr-3 text-sm text-white"
              placeholder="Recherche (référence)…"
            />
          </div>
          <select
            value={flow}
            onChange={(e) => {
              setPage(1);
              setFlow(e.target.value);
            }}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Tous flows</option>
            <option value="order">Commande</option>
            <option value="reservation">Réservation</option>
          </select>
          <select
            value={provider}
            onChange={(e) => {
              setPage(1);
              setProvider(e.target.value);
            }}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Tous providers</option>
            <option value="wave">Wave</option>
            <option value="orange">Orange Money</option>
            <option value="manual">Manuel</option>
            <option value="geniuspay">GeniusPay</option>
          </select>
          <select
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value);
            }}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Tous statuts</option>
            <option value="confirmed">Confirmé</option>
            <option value="pending">Pending</option>
            <option value="failed">Échec</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
              <span className="text-neutral-500">Lignes par page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPage(1);
                  setPageSize(Number(e.target.value));
                }}
                className="h-9 rounded-lg border border-white/10 bg-black px-2 text-sm text-white"
              >
                {PAYMENTS_PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <span title="Uniquement les lignes affichées sur cette page (filtre « à traiter » inclus).">
              Sur cette page — confirmés: {formatPrice(confirmedSum)}
            </span>
            <span className={failedCount > 0 ? 'text-red-300' : ''}>Échecs: {failedCount}</span>
            <span className={unmatchedCount > 0 ? 'text-amber-200' : ''}>
              À traiter: {unmatchedCount}
            </span>
            <span className="text-neutral-600">
              Total en base: {total.toLocaleString('fr-FR')} évén.
            </span>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[1180px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Référence</th>
              <th className="px-4 py-3 font-semibold">Montant</th>
              <th className="px-4 py-3 font-semibold">Cumul confirmé</th>
              <th className="px-4 py-3 font-semibold">Objectif</th>
              <th className="px-4 py-3 font-semibold">Reste objectif</th>
              <th className="px-4 py-3 font-semibold">Flow</th>
              <th className="px-4 py-3 font-semibold">Provider</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Match</th>
              <th className="px-4 py-3 font-semibold">Cible</th>
              <th className="px-4 py-3 font-semibold text-right">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((r) => (
              <tr key={r.id} className="bg-[#0c0c0c] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-xs text-tiktok-cyan">{r.reference}</td>
                <td className="px-4 py-3 font-semibold text-white">{formatPrice(r.amountFcfa)}</td>
                <td className="px-4 py-3 text-neutral-200">{formatPrice(r.confirmedCumulativeFcfa ?? 0)}</td>
                <td className="px-4 py-3 text-neutral-300">
                  {r.expectedFcfa != null ? formatPrice(r.expectedFcfa) : '—'}
                </td>
                <td className="px-4 py-3">
                  {r.balanceAfterFcfa != null ? (
                    <span
                      className={
                        r.balanceAfterFcfa === 0
                          ? 'font-semibold text-status-green'
                          : 'font-medium text-amber-200'
                      }
                    >
                      {formatPrice(r.balanceAfterFcfa)}
                      {r.balanceAfterFcfa === 0 ? ' · soldé' : ''}
                    </span>
                  ) : (
                    <span className="text-neutral-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-neutral-300">{r.flow}</td>
                <td className="px-4 py-3 text-neutral-300">{r.provider ?? '—'}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${statusPill(
                      r.status
                    )}`}
                  >
                    {r.status === 'confirmed' ? (
                      <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    ) : r.status === 'failed' ? (
                      <XCircle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    ) : (
                      <AlertTriangle className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                    )}
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${matchPill(
                      r.match
                    )}`}
                  >
                    {r.match ? 'OK' : 'À traiter'}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-400">
                  {r.target ? (
                    <span>
                      {r.target.kind === 'order' ? 'Commande' : 'Réservation'} —{' '}
                      <span className="text-white">{r.target.clientName}</span>
                    </span>
                  ) : (
                    <span className="text-amber-200">Aucune cible</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right text-xs text-neutral-500">
                  {new Date(r.createdAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-neutral-300">
        <p>
          Page <span className="font-semibold text-white">{currentPage}</span> sur{' '}
          <span className="font-semibold text-white">{totalPages}</span>
          {total > 0 ? (
            <span className="text-neutral-500">
              {' '}
              ({filtered.length} ligne{filtered.length > 1 ? 's' : ''} sur cette page
              {filterUnmatched ? ', filtre « à traiter » actif' : ''} ·{' '}
              {total.toLocaleString('fr-FR')} au total)
            </span>
          ) : null}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={currentPage <= 1 || isPending}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            Précédent
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages || isPending}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Suivant
            <ChevronRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendeusePaiementsPage;

