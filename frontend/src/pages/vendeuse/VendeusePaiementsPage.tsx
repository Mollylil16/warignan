import { type FormEvent, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, RefreshCw, Search, XCircle } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { usePaymentsList, type StaffPaymentEventRow } from '../../hooks/usePayments';
import { formatPrice } from '../../utils/formatPrice';

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

  const params = useMemo(
    () => ({
      q: q.trim() || undefined,
      flow: flow || undefined,
      provider: provider || undefined,
      status: status || undefined,
      limit: 300,
    }),
    [q, flow, provider, status]
  );

  const { data: rows = [], isPending, error, refetch } = usePaymentsList(params);

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void refetch();
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Paiements"
        description="Événements Wave / Orange Money / manuel. Match automatique sur commande/réservation."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10"
          >
            <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden />
            Actualiser
          </button>
        }
      />

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
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              strokeWidth={2}
              aria-hidden
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-black py-2 pl-10 pr-3 text-sm text-white"
              placeholder="Recherche (référence)…"
            />
          </div>
          <select
            value={flow}
            onChange={(e) => setFlow(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Tous flows</option>
            <option value="order">Commande</option>
            <option value="reservation">Réservation</option>
          </select>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Tous providers</option>
            <option value="wave">Wave</option>
            <option value="orange">Orange Money</option>
            <option value="manual">Manuel</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
          >
            <option value="">Tous statuts</option>
            <option value="confirmed">Confirmé</option>
            <option value="pending">Pending</option>
            <option value="failed">Échec</option>
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-400">
            <input
              type="checkbox"
              checked={filterUnmatched}
              onChange={(e) => setFilterUnmatched(e.target.checked)}
              className="h-4 w-4 accent-tiktok-cyan"
            />
            Afficher seulement “à traiter”
          </label>
          <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
            <span>Confirmés: {formatPrice(confirmedSum)}</span>
            <span className={failedCount > 0 ? 'text-red-300' : ''}>Échecs: {failedCount}</span>
            <span className={unmatchedCount > 0 ? 'text-amber-200' : ''}>
              À traiter: {unmatchedCount}
            </span>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Référence</th>
              <th className="px-4 py-3 font-semibold">Montant</th>
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
    </div>
  );
};

export default VendeusePaiementsPage;

