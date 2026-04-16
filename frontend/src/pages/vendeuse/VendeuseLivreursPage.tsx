import PageHeader from '../../components/vendeuse/PageHeader';
import { useCouriers } from '../../hooks/useCouriers';

const VendeuseLivreursPage = () => {
  const { data: couriers = [], isPending, error, refetch } = useCouriers();

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Livreurs"
        description="Comptes avec le rôle « livreur » (API). Utilise leur id pour l’assignation dans Livraisons si besoin."
        actions={
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5"
          >
            Actualiser
          </button>
        }
      />

      {error && <p className="mb-4 text-sm text-red-300">{String(error)}</p>}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <ul className="space-y-3">
        {couriers.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-neutral-300"
          >
            <p className="font-semibold text-white">{c.displayName}</p>
            <p className="font-mono text-xs text-neutral-500">{c.email}</p>
            <p className="mt-1 text-[10px] text-tiktok-cyan">id : {c.id}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendeuseLivreursPage;
