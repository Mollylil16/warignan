import { useMemo, useState } from 'react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { mockCouriers, mockDeliveries, type MockDelivery } from '../../data/vendeuseMock';

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

const statusLabel: Record<MockDelivery['status'], string> = {
  planned: 'A assigner',
  assigned: 'Livreur assigne',
  out: 'En tournee',
  done: 'Livree',
};

const VendeuseLivraisonsPage = () => {
  const [deliveries, setDeliveries] = useState(() => [...mockDeliveries]);
  const [selectedISO, setSelectedISO] = useState(() => toISO(new Date()));

  const weekStart = useMemo(() => startOfWeekMonday(new Date()), []);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const dayDeliveries = deliveries.filter((d) => d.dateISO === selectedISO);

  const assignCourier = (deliveryId: string, courierId: string) => {
    setDeliveries((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? { ...d, courierId: courierId || null, status: courierId ? 'assigned' : 'planned' }
          : d
      )
    );
  };

  const launchRun = (deliveryId: string) => {
    setDeliveries((prev) =>
      prev.map((d) => (d.id === deliveryId ? { ...d, status: 'out' as const } : d))
    );
  };

  const countForDay = (iso: string) => deliveries.filter((d) => d.dateISO === iso).length;

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Livraisons et agenda"
        description="Choisis un jour, vois les colis, assigne un livreur, lance la tournee (demo locale)."
        actions={
          <button
            type="button"
            className="rounded-lg bg-tiktok-cyan/15 px-4 py-2 text-sm font-bold text-tiktok-cyan hover:bg-tiktok-cyan/25"
          >
            Nouveau creneau (bientot)
          </button>
        }
      />

      <section className="mb-8 rounded-xl border border-white/10 bg-[#111] p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-neutral-500">
          Semaine en cours
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d) => {
            const iso = toISO(d);
            const sel = iso === selectedISO;
            const n = countForDay(iso);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedISO(iso)}
                className={`rounded-lg border px-2 py-3 text-center transition ${
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
      </section>

      <h2 className="mb-4 text-lg font-bold text-white">
        Creneau du{' '}
        {new Date(selectedISO + 'T12:00:00').toLocaleDateString('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
      </h2>

      {dayDeliveries.length === 0 ? (
        <p className="rounded-xl border border-dashed border-white/15 bg-[#111] p-8 text-center text-sm text-neutral-500">
          Aucune livraison ce jour (donnees fictives). Change de jour ou edite vendeuseMock.
        </p>
      ) : (
        <ul className="space-y-4">
          {dayDeliveries.map((d) => {
            const courier = mockCouriers.find((c) => c.id === d.courierId);
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
                    Fenetre : {d.windowLabel} - {statusLabel[d.status]}
                  </p>
                  {courier && (
                    <p className="mt-2 text-sm text-tiktok-cyan">
                      Livreur : {courier.name} - {courier.phone}
                    </p>
                  )}
                </div>
                <div className="mt-4 flex shrink-0 flex-col gap-2 sm:mt-0 sm:w-56">
                  <label className="text-xs text-neutral-500">Assigner</label>
                  <select
                    value={d.courierId ?? ''}
                    onChange={(e) => assignCourier(d.id, e.target.value)}
                    className="rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                  >
                    <option value="">Choisir</option>
                    {mockCouriers
                      .filter((c) => c.active)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => launchRun(d.id)}
                    disabled={!d.courierId || d.status === 'done' || d.status === 'out'}
                    className="rounded-lg bg-reserve-purple py-2 text-xs font-bold uppercase text-white hover:brightness-110 disabled:opacity-40"
                  >
                    Lancer la tournee
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
