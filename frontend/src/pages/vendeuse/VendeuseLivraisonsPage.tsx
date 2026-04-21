import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../components/vendeuse/PageHeader';
import { useCouriers } from '../../hooks/useCouriers';
import { useDeliveriesList, type DeliveryRow } from '../../hooks/useDeliveries';
import { api } from '../../services/api';

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  const day = x.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  x.setDate(x.getDate() + diff);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const statusLabel: Record<string, string> = {
  planned: 'À assigner',
  assigned: 'Livreur assigné',
  out: 'En tournée',
  done: 'Livrée',
};

const VendeuseLivraisonsPage = () => {
  const qc = useQueryClient();
  const { data: deliveries = [], isPending, error, refetch } = useDeliveriesList();
  const { data: couriers = [] } = useCouriers();
  const [selectedISO, setSelectedISO] = useState(() => toISO(new Date()));

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const patch = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Record<string, unknown> }) => {
      await api.patch(`/deliveries/${id}`, body);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['deliveries'] }),
  });

  const dayDeliveries = (deliveries as DeliveryRow[]).filter((d) => d.dateISO === selectedISO);

  const assignCourier = (deliveryId: string, courierId: string) => {
    if (!courierId) {
      patch.mutate({ id: deliveryId, body: { courierId: null, status: 'planned' } });
    } else {
      patch.mutate({ id: deliveryId, body: { courierId, status: 'assigned' } });
    }
  };

  const launchRun = (deliveryId: string) => {
    patch.mutate({ id: deliveryId, body: { status: 'out' } });
  };

  const countForDay = (iso: string) =>
    (deliveries as DeliveryRow[]).filter((d) => d.dateISO === iso).length;

  const courierName = (id: string | null) =>
    couriers.find((c) => c.id === id)?.displayName ?? null;

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Livraisons et agenda"
        description="Données API : assignation livreur (id réel) et statuts."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-tiktok-cyan/15 px-4 py-2 text-sm font-bold text-tiktok-cyan hover:bg-tiktok-cyan/25"
          >
            Actualiser
          </button>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {String(error)}
        </p>
      )}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <section className="mb-8 rounded-xl border border-white/10 bg-[#111] p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">
          Semaine en cours
        </h2>
        <div className="-mx-1 overflow-x-auto px-1 [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-2 sm:min-w-0 sm:grid sm:grid-cols-7">
            {weekDays.map((d) => {
              const iso = toISO(d);
              const sel = iso === selectedISO;
              const n = countForDay(iso);
              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedISO(iso)}
                  className={`w-[84px] rounded-lg border px-2 py-3 text-center transition sm:w-auto ${
                    sel
                      ? 'border-tiktok-pink bg-tiktok-pink/15 text-white'
                      : 'border-white/10 bg-[#0a0a0a] text-neutral-400 hover:border-white/20'
                  }`}
                >
                  <p className="text-[10px] uppercase text-neutral-500">
                    {d.toLocaleDateString('fr-FR', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-bold tabular-nums">{d.getDate()}</p>
                  <p className="text-[10px] text-neutral-600">{n} colis</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <h2 className="mb-4 text-lg font-bold text-white">
        Créneau du{' '}
        {new Date(selectedISO + 'T12:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </h2>

      {dayDeliveries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-[#111] p-8 text-center text-sm text-neutral-500">
          Aucune livraison planifiée pour cette date. Les créneaux apparaissent ici lorsque des
          livraisons existent dans la base (créées avec la commande ou depuis un outil interne).
        </p>
      ) : (
        <ul className="space-y-4">
          {dayDeliveries.map((d) => {
            const cname = courierName(d.courierId);
            return (
              <li
                key={d.id}
                className="rounded-xl border border-white/10 bg-[#111] p-4 sm:flex sm:items-start sm:justify-between sm:gap-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-tiktok-cyan">{d.orderRef}</p>
                  <p className="font-semibold text-white">{d.clientName}</p>
                  <p className="mt-1 text-sm text-neutral-400">{d.address}</p>
                  <p className="mt-2 text-xs text-neutral-500">
                    Fenêtre : {d.windowLabel} — {statusLabel[d.status] ?? d.status}
                  </p>
                  {cname && (
                    <p className="mt-2 text-sm text-tiktok-cyan">Livreur : {cname}</p>
                  )}
                </div>
                <div className="mt-4 flex shrink-0 flex-col gap-2 sm:mt-0 sm:w-56">
                  <label className="text-xs text-neutral-500">Assigner</label>
                  <select
                    value={d.courierId ?? ''}
                    disabled={patch.isPending}
                    onChange={(e) => assignCourier(d.id, e.target.value)}
                    className="rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                  >
                    <option value="">—</option>
                    {couriers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.displayName}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => launchRun(d.id)}
                    disabled={!d.courierId || d.status === 'done' || d.status === 'out' || patch.isPending}
                    className="rounded-lg bg-reserve-purple py-2 text-xs font-bold uppercase text-white hover:brightness-110 disabled:opacity-40"
                  >
                    Lancer la tournée
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default VendeuseLivraisonsPage;
