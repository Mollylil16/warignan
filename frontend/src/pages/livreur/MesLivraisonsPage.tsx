import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone, RefreshCw } from 'lucide-react';
import { useDeliveriesList, type DeliveryRow } from '../../hooks/useDeliveries';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const TABS = [
  { key: 'all', label: 'Toutes' },
  { key: 'assigned', label: 'Assignées' },
  { key: 'out', label: 'En tournée' },
  { key: 'done', label: 'Terminées' },
] as const;

type TabKey = typeof TABS[number]['key'];

const statusBadge: Record<string, string> = {
  planned: 'bg-white/10 text-neutral-400',
  assigned: 'bg-tiktok-pink/15 text-tiktok-pink',
  out: 'bg-amber-500/15 text-amber-300',
  done: 'bg-status-green/15 text-status-green',
};

const statusLabel: Record<string, string> = {
  planned: 'A planifier',
  assigned: 'Assignee',
  out: 'En tournee',
  done: 'Terminee',
};

const MesLivraisonsPage = () => {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<TabKey>('all');

  const statusParam = tab === 'all' ? undefined : tab;
  const { data: deliveries = [], isPending, error, refetch, isFetching } = useDeliveriesList({
    status: statusParam,
  });

  const patch = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      await api.patch(`/deliveries/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  });

  const goOut = (id: string) => patch.mutate({ id, body: { status: 'out' } });
  const goDone = (id: string) => patch.mutate({ id, body: { status: 'done' } });

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-white">Mes livraisons</h1>
          <p className="text-sm text-neutral-500">
            Connecte en tant que{' '}
            <strong className="text-neutral-300">{user?.displayName}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refetch()}
          disabled={isFetching}
          className="mt-1 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-400 hover:bg-white/10 disabled:opacity-40"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={2} aria-hidden />
          Actualiser
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {String(error)}
        </p>
      )}

      {/* Tabs */}
      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-[#111] p-1">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              tab === key
                ? 'bg-tiktok-pink text-white'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isPending ? (
        <ul className="space-y-3">
          {[1, 2, 3].map((i) => (
            <li key={i} className="animate-pulse rounded-xl border border-white/10 bg-[#111] p-5">
              <div className="mb-3 flex justify-between">
                <div className="h-3 w-28 rounded bg-white/5" />
                <div className="h-3 w-16 rounded bg-white/5" />
              </div>
              <div className="mb-2 h-4 w-36 rounded bg-white/5" />
              <div className="h-3 w-56 rounded bg-white/5" />
            </li>
          ))}
        </ul>
      ) : deliveries.length === 0 ? (
        <p className="rounded-lg border border-white/10 bg-[#111] p-6 text-center text-sm text-neutral-500">
          Aucune livraison{tab !== 'all' ? ` dans cet etat` : ''} pour ton compte.
        </p>
      ) : (
        <ul className="space-y-3">
          {(deliveries as DeliveryRow[]).map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-white/10 bg-[#111] p-4 sm:p-5"
            >
              <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                <p className="font-mono text-sm text-tiktok-cyan">{d.orderRef}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${statusBadge[d.status] ?? 'bg-white/10 text-neutral-400'}`}
                >
                  {statusLabel[d.status] ?? d.status}
                </span>
              </div>

              <p className="mb-2 font-medium text-white">{d.clientName}</p>

              {d.clientPhone && (
                <a
                  href={`tel:${d.clientPhone}`}
                  className="mb-2 flex items-center gap-2 text-sm text-tiktok-cyan hover:underline"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
                  {d.clientPhone}
                </a>
              )}

              <a
                href={`https://maps.google.com/maps?q=${encodeURIComponent(d.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 flex items-start gap-2 text-sm text-neutral-400 hover:text-tiktok-cyan"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" strokeWidth={2} aria-hidden />
                {d.address}
              </a>

              <p className="text-xs text-neutral-600">
                {d.dateISO} &middot; {d.windowLabel}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {d.status === 'assigned' && (
                  <button
                    type="button"
                    disabled={patch.isPending}
                    onClick={() => goOut(d.id)}
                    className="rounded-lg bg-tiktok-pink px-3 py-1.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
                  >
                    Demarrer la tournee
                  </button>
                )}
                {d.status === 'out' && (
                  <button
                    type="button"
                    disabled={patch.isPending}
                    onClick={() => goDone(d.id)}
                    className="rounded-lg bg-status-green/20 px-3 py-1.5 text-xs font-bold text-status-green hover:bg-status-green/30 disabled:opacity-50"
                  >
                    Marquer livree
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-6 text-center text-xs text-neutral-700">
        Actualisation automatique toutes les 60 secondes
      </p>
    </div>
  );
};

export default MesLivraisonsPage;
