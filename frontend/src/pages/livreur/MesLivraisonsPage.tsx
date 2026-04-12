import { MapPin, Phone } from 'lucide-react';
import { mockCouriers, mockDeliveries, type DeliveryRunStatus } from '../../data/vendeuseMock';

/** Livreur démo : même profil que dans les données fictives (Kouassi). */
const DEMO_COURIER_ID = 'c1';

const statusLabel: Record<DeliveryRunStatus, string> = {
  planned: 'À planifier',
  assigned: 'Assignée',
  out: 'En tournée',
  done: 'Terminée',
};

const MesLivraisonsPage = () => {
  const courier = mockCouriers.find((c) => c.id === DEMO_COURIER_ID);
  const mine = mockDeliveries.filter((d) => d.courierId === DEMO_COURIER_ID);
  const pool = mockDeliveries.filter((d) => d.courierId === null && d.status === 'planned');

  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Mes livraisons</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Vue démo pour le livreur <strong className="text-neutral-300">{courier?.name ?? '—'}</strong>
        . Les courses ouvertes et ton planning sont simulés.
      </p>

      {courier && (
        <div className="mb-8 rounded-xl border border-white/10 bg-[#111] p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
            <Phone className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
            Contact
          </p>
          <p className="font-mono text-sm text-neutral-400">{courier.phone}</p>
          <p className="mt-2 text-xs text-neutral-600">Zones : {courier.zones.join(', ')}</p>
        </div>
      )}

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-tiktok-pink">
          Tournées assignées
        </h2>
        {mine.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-[#111] p-4 text-sm text-neutral-500">
            Aucune livraison assignée pour l’instant.
          </p>
        ) : (
          <ul className="space-y-3">
            {mine.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-white/10 bg-[#111] p-4 sm:p-5"
              >
                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                  <p className="font-mono text-sm text-tiktok-cyan">{d.orderRef}</p>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-semibold text-neutral-300">
                    {statusLabel[d.status]}
                  </span>
                </div>
                <p className="mb-1 font-medium text-white">{d.clientName}</p>
                <p className="mb-2 flex items-start gap-2 text-sm text-neutral-400">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-neutral-600" strokeWidth={2} />
                  {d.address}
                </p>
                <p className="text-xs text-neutral-600">
                  {d.dateISO} · {d.windowLabel}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Créneaux ouverts (non assignés)
        </h2>
        {pool.length === 0 ? (
          <p className="text-sm text-neutral-600">Rien à afficher.</p>
        ) : (
          <ul className="space-y-3">
            {pool.map((d) => (
              <li
                key={d.id}
                className="rounded-xl border border-dashed border-white/15 bg-black/40 p-4"
              >
                <p className="font-mono text-sm text-neutral-500">{d.orderRef}</p>
                <p className="text-sm text-neutral-400">{d.clientName}</p>
                <p className="text-xs text-neutral-600">{d.address}</p>
                <p className="mt-2 text-[11px] text-neutral-600">
                  Prise en charge côté vendeuse (démo).
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default MesLivraisonsPage;
