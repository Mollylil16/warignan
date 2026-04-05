import { useMemo, useState } from 'react';
import PageHeader from '../../components/vendeuse/PageHeader';
import {
  mockReservations,
  type DepositStatus,
  type MockReservation,
  type ReservationWorkflow,
} from '../../data/vendeuseMock';
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
  const [rows, setRows] = useState<MockReservation[]>(() => [...mockReservations]);
  const [filter, setFilter] = useState<'all' | 'action' | 'deposit'>('all');

  const filtered = useMemo(() => {
    if (filter === 'action')
      return rows.filter((r) => r.workflow === 'awaiting_validation');
    if (filter === 'deposit') return rows.filter((r) => r.depositStatus === 'pending');
    return rows;
  }, [rows, filter]);

  const validate = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.workflow === 'awaiting_validation'
          ? { ...r, workflow: 'validated' as const }
          : r
      )
    );
  };

  const reject = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id && r.workflow !== 'cancelled'
          ? { ...r, workflow: 'cancelled' as const }
          : r
      )
    );
  };

  const markDepositPaid = (id: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              depositStatus: 'paid' as const,
              workflow:
                r.workflow === 'awaiting_deposit'
                  ? ('awaiting_validation' as const)
                  : r.workflow,
            }
          : r
      )
    );
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Réservations"
        description="Suis les acomptes (Wave / Orange Money), puis valide ou refuse la réservation. Les changements sont locaux (démo) jusqu’à l’API."
        actions={
          <button
            type="button"
            className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/10"
          >
            Exporter (bientôt)
          </button>
        }
      />

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

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Référence</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">Articles</th>
              <th className="px-4 py-3 font-semibold">Total</th>
              <th className="px-4 py-3 font-semibold">Acompte</th>
              <th className="px-4 py-3 font-semibold">Statut acompte</th>
              <th className="px-4 py-3 font-semibold">Étape</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((r) => (
              <tr key={r.id} className="bg-[#0c0c0c] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-xs text-tiktok-cyan">{r.reference}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{r.clientName}</p>
                  <p className="text-xs text-neutral-500">{r.clientPhone}</p>
                </td>
                <td className="max-w-[200px] px-4 py-3 text-neutral-400">
                  {r.productsSummary}
                </td>
                <td className="px-4 py-3 font-semibold text-white">{formatPrice(r.totalFcfa)}</td>
                <td className="px-4 py-3 text-neutral-300">{formatPrice(r.depositFcfa)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pillDeposit(r.depositStatus)}`}
                  >
                    {depositLabel[r.depositStatus]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${pillWorkflow(r.workflow)}`}
                  >
                    {workflowLabel[r.workflow]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {r.depositStatus === 'pending' && (
                      <button
                        type="button"
                        onClick={() => markDepositPaid(r.id)}
                        className="rounded-lg border border-tiktok-cyan/40 bg-tiktok-cyan/10 px-2 py-1 text-[11px] font-bold text-tiktok-cyan hover:bg-tiktok-cyan/20"
                      >
                        Marquer acompte reçu
                      </button>
                    )}
                    {r.workflow === 'awaiting_validation' && (
                      <>
                        <button
                          type="button"
                          onClick={() => validate(r.id)}
                          className="rounded-lg bg-status-green/20 px-2 py-1 text-[11px] font-bold text-status-green hover:bg-status-green/30"
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          onClick={() => reject(r.id)}
                          className="rounded-lg border border-red-500/40 px-2 py-1 text-[11px] font-bold text-red-400 hover:bg-red-500/10"
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default VendeuseReservationsPage;
