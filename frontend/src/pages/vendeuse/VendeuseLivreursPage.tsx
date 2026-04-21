import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Save, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { createCourier, deleteCourier, patchCourier, useCouriers } from '../../hooks/useCouriers';
import { apiErrorMessage } from '../../services/api';

const VendeuseLivreursPage = () => {
  const qc = useQueryClient();
  const { data: couriers = [], isPending, error, refetch, isFetching } = useCouriers();
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const sorted = useMemo(
    () => [...couriers].sort((a, b) => a.displayName.localeCompare(b.displayName, 'fr')),
    [couriers]
  );

  const createM = useMutation({
    mutationFn: createCourier,
    onSuccess: () => {
      setCreateName('');
      setCreateEmail('');
      setShowCreate(false);
      void qc.invalidateQueries({ queryKey: ['users', 'couriers'] });
    },
    onError: (e) => setCreateErr(apiErrorMessage(e, 'Création impossible.')),
  });

  const patchM = useMutation({
    mutationFn: async (args: { id: string; displayName: string; email: string }) =>
      patchCourier(args.id, { displayName: args.displayName, email: args.email }),
    onSuccess: () => {
      setEditId(null);
      void qc.invalidateQueries({ queryKey: ['users', 'couriers'] });
    },
  });

  const deleteM = useMutation({
    mutationFn: deleteCourier,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'couriers'] }),
  });

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Livreurs"
        description="Carnet de partenaires. Les livreurs ne se connectent pas : c’est la vendeuse qui les crée et qui les assigne aux commandes/livraisons."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              {showCreate ? 'Fermer' : 'Nouveau livreur'}
            </button>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isFetching ? 'Actualisation…' : 'Actualiser'}
            </button>
          </div>
        }
      />

      {error && <p className="mb-4 text-sm text-red-300">{String(error)}</p>}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      {showCreate && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCreateErr(null);
            createM.mutate({ displayName: createName.trim(), email: createEmail.trim().toLowerCase() });
          }}
          className="mb-5 rounded-xl border border-white/10 bg-[#111] p-4"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            <input
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white sm:col-span-2"
              placeholder="Nom du livreur (ex. Livreur partenaire)"
              required
            />
            <input
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
              placeholder="Email (pour identifier)"
              required
            />
          </div>
          {createErr && <p className="mt-2 text-sm text-red-300">{createErr}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={createM.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-reserve-purple px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
              {createM.isPending ? 'Création…' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      <ul className="space-y-3">
        {sorted.map((c) => (
          <li
            key={c.id}
            className="rounded-xl border border-white/10 bg-[#111] px-4 py-3 text-sm text-neutral-300"
          >
            {editId === c.id ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  patchM.mutate({ id: c.id, displayName: editName.trim(), email: editEmail.trim().toLowerCase() });
                }}
                className="grid gap-3 sm:grid-cols-3"
              >
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white sm:col-span-2"
                  required
                />
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
                  required
                />
                <div className="flex flex-wrap gap-2 sm:col-span-3">
                  <button
                    type="submit"
                    disabled={patchM.isPending}
                    className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditId(null)}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5"
                  >
                    <X className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white">{c.displayName}</p>
                  <p className="font-mono text-xs text-neutral-500">{c.email}</p>
                  <p className="mt-1 text-[10px] text-tiktok-cyan">id : {c.id}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(c.id);
                      setEditName(c.displayName);
                      setEditEmail(c.email);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5"
                  >
                    <Pencil className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Modifier
                  </button>
                  <button
                    type="button"
                    disabled={deleteM.isPending}
                    onClick={() => {
                      if (!window.confirm(`Supprimer « ${c.displayName} » ?`)) return;
                      deleteM.mutate(c.id);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                    Supprimer
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default VendeuseLivreursPage;
