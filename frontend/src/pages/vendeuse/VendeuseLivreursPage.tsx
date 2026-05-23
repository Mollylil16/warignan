import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Copy, Plus, Trash2, X } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import {
  createLivreur,
  deleteLivreur,
  useLivreurs,
  type LivreurCreated,
} from '../../hooks/useLivreurs';
import { apiErrorMessage } from '../../services/api';

// Modale affichant le mot de passe généré (une seule fois)
function MotDePasseModal({
  livreur,
  onClose,
}: {
  livreur: LivreurCreated;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(livreur.motDePasse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#111] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-status-green/20">
              <Check className="h-4 w-4 text-status-green" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-status-green">Livreur créé</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" strokeWidth={2} />
          </button>
        </div>

        <div className="mb-5 space-y-2 rounded-xl bg-black/40 p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-neutral-500">Nom</span>
            <span className="font-semibold text-white">{livreur.displayName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Téléphone</span>
            <span className="font-mono text-white">{livreur.phone ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Mot de passe</span>
            <span className="font-mono text-lg font-bold tracking-widest text-tiktok-cyan">
              {livreur.motDePasse}
            </span>
          </div>
        </div>

        <p className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
          Notez ce mot de passe maintenant. Il ne sera plus affiché après fermeture.
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-white hover:bg-white/5"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-status-green" strokeWidth={2} />
                Copié !
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" strokeWidth={2} />
                Copier le mot de passe
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-tiktok-pink px-5 py-2.5 text-sm font-bold text-white hover:brightness-110"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

const VendeuseLivreursPage = () => {
  const qc = useQueryClient();
  const { data: livreurs = [], isPending, error, refetch, isFetching } = useLivreurs();

  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [newLivreur, setNewLivreur] = useState<LivreurCreated | null>(null);

  const createM = useMutation({
    mutationFn: createLivreur,
    onSuccess: (data) => {
      setName('');
      setPhone('');
      setShowCreate(false);
      setCreateErr(null);
      setNewLivreur(data);
      void qc.invalidateQueries({ queryKey: ['admin', 'livreurs'] });
    },
    onError: (e) => setCreateErr(apiErrorMessage(e, 'Création impossible.')),
  });

  const deleteM = useMutation({
    mutationFn: deleteLivreur,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'livreurs'] }),
    onError: (e) => alert(apiErrorMessage(e, 'Suppression impossible.')),
  });

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Livreurs"
        description="Créez les comptes livreurs. La connexion se fait sur /livreur/login avec le nom et le mot de passe généré."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setShowCreate((v) => !v);
                setCreateErr(null);
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              {showCreate ? 'Fermer' : 'Nouveau livreur'}
            </button>
            <button
              type="button"
              disabled={isFetching}
              onClick={() => void refetch()}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5 disabled:opacity-50"
            >
              {isFetching ? 'Actualisation…' : 'Actualiser'}
            </button>
          </div>
        }
      />

      {error && <p className="mb-4 text-sm text-red-300">{String(error)}</p>}

      {/* Formulaire de création */}
      {showCreate && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCreateErr(null);
            createM.mutate({ displayName: name.trim(), phone: phone.trim() });
          }}
          className="mb-5 rounded-xl border border-white/10 bg-[#111] p-4"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Nouveau livreur
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white placeholder:text-neutral-600"
              placeholder="Nom complet (ex. Koné Mamadou)"
              required
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 rounded-lg border border-white/10 bg-black px-3 text-sm text-white placeholder:text-neutral-600"
              placeholder="Téléphone (ex. 0708091011)"
              required
            />
          </div>
          <p className="mt-2 text-[11px] text-neutral-600">
            Le mot de passe de 6 caractères sera généré automatiquement et affiché une seule fois.
          </p>
          {createErr && <p className="mt-2 text-sm text-red-300">{createErr}</p>}
          <div className="mt-3 flex gap-2">
            <button
              type="submit"
              disabled={createM.isPending}
              className="rounded-lg bg-reserve-purple px-5 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              {createM.isPending ? 'Création…' : 'Créer le livreur'}
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

      {/* Liste */}
      {isPending ? (
        <p className="text-sm text-neutral-500">Chargement…</p>
      ) : livreurs.length === 0 ? (
        <p className="rounded-xl border border-white/10 bg-[#111] p-6 text-center text-sm text-neutral-500">
          Aucun livreur. Créez-en un avec le bouton ci-dessus.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Téléphone</th>
                <th className="hidden px-4 py-3 sm:table-cell">Depuis le</th>
                <th className="px-4 py-3 text-center">Actives</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {livreurs.map((l) => (
                <tr key={l.id} className="bg-[#111] transition-colors hover:bg-white/5">
                  <td className="px-4 py-3 font-medium text-white">{l.displayName}</td>
                  <td className="px-4 py-3 font-mono text-neutral-400">
                    {l.phone ?? <span className="text-neutral-600">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                    {new Date(l.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold ${
                        l.livraisonsActives > 0
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'bg-white/5 text-neutral-600'
                      }`}
                    >
                      {l.livraisonsActives}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      disabled={deleteM.isPending || l.livraisonsActives > 0}
                      onClick={() => {
                        if (!window.confirm(`Supprimer « ${l.displayName} » ?`)) return;
                        deleteM.mutate(l.id);
                      }}
                      title={
                        l.livraisonsActives > 0
                          ? 'Livraisons actives — impossible de supprimer'
                          : 'Supprimer'
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modale mot de passe */}
      {newLivreur && (
        <MotDePasseModal livreur={newLivreur} onClose={() => setNewLivreur(null)} />
      )}
    </div>
  );
};

export default VendeuseLivreursPage;
