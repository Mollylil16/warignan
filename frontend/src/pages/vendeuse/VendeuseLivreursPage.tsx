import { useState } from 'react';
import { Phone, MapPin, Pencil } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { mockCouriers, type MockCourier } from '../../data/vendeuseMock';

const VendeuseLivreursPage = () => {
  const [couriers, setCouriers] = useState<MockCourier[]>(() => [...mockCouriers]);

  const toggle = (id: string) => {
    setCouriers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Livreurs"
        description="Carnet des partenaires : zones, téléphone, activation. Formulaire d’édition complet à brancher sur l’API."
        actions={
          <button
            type="button"
            className="rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
          >
            Ajouter un livreur
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {couriers.map((c) => (
          <article
            key={c.id}
            className={`rounded-xl border p-5 transition ${
              c.active
                ? 'border-white/15 bg-[#111]'
                : 'border-white/5 bg-[#0a0a0a] opacity-70'
            }`}
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-reserve-purple/40 to-tiktok-pink/30 text-lg font-bold text-white">
                {c.name.charAt(0)}
              </div>
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${
                  c.active
                    ? 'bg-status-green/20 text-status-green'
                    : 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {c.active ? 'Actif' : 'Inactif'}
              </button>
            </div>
            <h3 className="font-bold text-white">{c.name}</h3>
            <p className="mt-2 flex items-center gap-2 text-sm text-neutral-400">
              <Phone className="h-4 w-4 shrink-0 text-tiktok-cyan" strokeWidth={2} />
              {c.phone}
            </p>
            <p className="mt-2 flex items-start gap-2 text-sm text-neutral-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-reserve-purple" strokeWidth={2} />
              {c.zones.join(' · ')}
            </p>
            {c.note && <p className="mt-2 text-xs text-neutral-600">{c.note}</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                Modifier
              </button>
              <button
                type="button"
                className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-500 hover:text-white"
              >
                Historique
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default VendeuseLivreursPage;
