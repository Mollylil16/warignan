import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Phone } from 'lucide-react';
import { useDeliveriesList, type DeliveryRow } from '../../hooks/useDeliveries';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

const statusLabel: Record<string, string> = {
  planned: 'À planifier',
  assigned: 'Assignée',
  out: 'En tournée',
  done: 'Terminée',
};

const MesLivraisonsPage = () => {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const { data: all = [], isPending, error, refetch } = useDeliveriesList();

  const mine = (all as DeliveryRow[]).filter((d) => d.courierId === user?.id);

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
      <h1 className="mb-2 text-2xl font-bold text-white">Mes livraisons</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Connecté en tant que <strong className="text-neutral-300">{user?.displayName}</strong>.
        Les courses listées proviennent de l’API.
      </p>

      {error && <p className="mb-4 text-sm text-red-300">{String(error)}</p>}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <div className="mb-8 rounded-xl border border-white/10 bg-[#111] p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
          <Phone className="h-4 w-4 text-tiktok-cyan" strokeWidth={2} aria-hidden />
          Compte
        </p>
        <p className="font-mono text-sm text-neutral-400">{user?.email}</p>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-tiktok-pink">
          Tournées assignées
        </h2>
        {mine.length === 0 ? (
          <p className="rounded-lg border border-white/10 bg-[#111] p-4 text-sm text-neutral-500">
            Aucune livraison assignée à ton compte pour l’instant.
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
                    {statusLabel[d.status] ?? d.status}
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
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.status === 'assigned' && (
                    <button
                      type="button"
                      disabled={patch.isPending}
                      onClick={() => goOut(d.id)}
                      className="rounded-lg bg-tiktok-pink px-3 py-1.5 text-xs font-bold text-white hover:brightness-110"
                    >
                      Démarrer la tournée
                    </button>
                  )}
                  {d.status === 'out' && (
                    <button
                      type="button"
                      disabled={patch.isPending}
                      onClick={() => goDone(d.id)}
                      className="rounded-lg bg-status-green/20 px-3 py-1.5 text-xs font-bold text-status-green hover:bg-status-green/30"
                    >
                      Marquer livrée
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-xs text-neutral-600">
        <button type="button" onClick={() => void refetch()} className="underline hover:text-white">
          Actualiser
        </button>
      </p>
    </div>
  );
};

export default MesLivraisonsPage;
