import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ImagePlus, Plus, Save } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { useStaffProductMutations, useStaffProductsList } from '../../hooks/useStaffProducts';
import { api, apiErrorMessage } from '../../services/api';
import { STAFF_LIST_LIMIT } from '../../constants/apiPagination';
import { absoluteMediaUrl } from '../../utils/mediaUrl';
import { formatPrice } from '../../utils/formatPrice';

type MediaRow = {
  id: string;
  url: string;
  filename: string;
  gallery: string;
  isPrimary: boolean;
  createdAt: string;
};

export default function VendeuseProduitsPage() {
  const qc = useQueryClient();
  const { data: products = [], isPending, error, refetch } = useStaffProductsList();
  const { create, patch } = useStaffProductMutations();

  const [showCreate, setShowCreate] = useState(false);
  const [code, setCode] = useState('');
  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [prix, setPrix] = useState(15000);
  const [category, setCategory] = useState<'robe' | 'crop'>('robe');
  const [stock, setStock] = useState(1);
  const [featured, setFeatured] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const mediaQ = useQuery({
    queryKey: ['media', 'picker'],
    queryFn: async () => {
      const { data } = await api.get<{ data: MediaRow[] }>('/media', {
        params: { page: 1, limit: STAFF_LIST_LIMIT },
      });
      return data.data;
    },
  });

  const uploadM = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('gallery', category === 'robe' ? 'robes' : 'crops');
      fd.append('isPrimary', 'false');
      const { data } = await api.post<MediaRow>('/media', fd);
      return data;
    },
    onSuccess: (row) => {
      void qc.invalidateQueries({ queryKey: ['media'] });
      void qc.invalidateQueries({ queryKey: ['media', 'picker'] });
      setSelectedUrls((s) => [row.url, ...s]);
    },
  });

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((f) => uploadM.mutate(f));
    e.target.value = '';
  };

  const availableMedia = useMemo(() => {
    const list = mediaQ.data ?? [];
    const allowed = category === 'robe' ? 'robes' : 'crops';
    return list.filter((m) => m.gallery === allowed).slice(0, 60);
  }, [mediaQ.data, category]);

  const toggleUrl = (url: string) => {
    setSelectedUrls((s) => (s.includes(url) ? s.filter((u) => u !== url) : [url, ...s]));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setCreateErr(null);
    const imgs = selectedUrls.filter(Boolean);
    if (imgs.length === 0) {
      setCreateErr('Ajoute au moins une image produit.');
      return;
    }
    create.mutate(
      {
        ...(code.trim() ? { code: code.trim() } : {}),
        nom: nom.trim(),
        description: description.trim(),
        prix,
        category,
        imageName: imgs,
        stock,
        featured,
      },
      {
        onSuccess: () => {
          setCode('');
          setNom('');
          setDescription('');
          setPrix(15000);
          setCategory('robe');
          setStock(1);
          setFeatured(false);
          setSelectedUrls([]);
          setShowCreate(false);
        },
        onError: (err) => setCreateErr(apiErrorMessage(err, 'Création impossible.')),
      }
    );
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Produits / Tenues"
        description="C’est ici qu’on crée les tenues visibles par les clientes (catalogue / fouille)."
        actions={
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refetch()}
              className="rounded-lg border border-white/15 px-4 py-2 text-sm text-neutral-300 hover:bg-white/5"
            >
              Actualiser
            </button>
            <button
              type="button"
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center gap-2 rounded-lg bg-tiktok-pink px-4 py-2 text-sm font-bold text-white hover:brightness-110"
            >
              <Plus className="h-4 w-4" strokeWidth={2} aria-hidden />
              {showCreate ? 'Fermer' : 'Nouvelle tenue'}
            </button>
          </div>
        }
      />

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {String(error)}
        </p>
      )}
      {isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      {showCreate && (
        <form onSubmit={submit} className="mb-8 rounded-xl border border-white/10 bg-[#111] p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Code</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                placeholder="Auto (ex. RB-4F2A1C) — tu peux aussi saisir"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Nom</label>
              <input
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                placeholder="Robe satin noir"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Catégorie</label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value as 'robe' | 'crop');
                  setSelectedUrls([]);
                }}
                className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
              >
                <option value="robe">Robe</option>
                <option value="crop">Crop top</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Prix (FCFA)</label>
              <input
                type="number"
                min={1}
                value={prix}
                onChange={(e) => setPrix(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-500">Stock</label>
              <input
                type="number"
                min={0}
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                className="w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 accent-tiktok-cyan"
                />
                Mise en avant
              </label>
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-xs font-semibold text-neutral-500">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white"
              placeholder="Détails, taille, matière, etc."
            />
          </div>

          <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-white">Images produit</p>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-neutral-300 hover:bg-white/5 hover:text-white">
                <ImagePlus className="h-4 w-4 text-tiktok-pink" strokeWidth={2} aria-hidden />
                Uploader
                <input type="file" accept="image/*" multiple className="sr-only" onChange={onFiles} />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-6">
              {availableMedia.map((m) => {
                const active = selectedUrls.includes(m.url);
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => toggleUrl(m.url)}
                    className={`overflow-hidden rounded-lg border ${
                      active ? 'border-tiktok-cyan' : 'border-white/10'
                    } bg-[#111]`}
                    title={m.filename}
                  >
                    <img src={absoluteMediaUrl(m.url)} alt="" className="aspect-[3/4] w-full object-cover" />
                  </button>
                );
              })}
            </div>

            {selectedUrls.length > 0 && (
              <p className="mt-3 text-xs text-neutral-500">
                Sélection : <span className="font-semibold text-neutral-300">{selectedUrls.length}</span> image(s)
              </p>
            )}
          </div>

          {createErr && <p className="mt-3 text-sm text-red-300">{createErr}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="submit"
              disabled={create.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-reserve-purple px-6 py-2 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
            >
              <Save className="h-4 w-4" strokeWidth={2} aria-hidden />
              {create.isPending ? 'Création…' : 'Créer et publier'}
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#111] text-xs uppercase tracking-wide text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Code</th>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Catégorie</th>
              <th className="px-4 py-3 font-semibold">Prix</th>
              <th className="px-4 py-3 font-semibold">Stock</th>
              <th className="px-4 py-3 font-semibold">Mise en avant</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {products.map((p) => (
              <tr key={p.id} className="bg-[#0c0c0c] hover:bg-white/[0.02]">
                <td className="px-4 py-3 font-mono text-xs font-bold text-tiktok-cyan">{p.code}</td>
                <td className="px-4 py-3 text-neutral-200">{p.nom}</td>
                <td className="px-4 py-3 text-neutral-400">{p.category}</td>
                <td className="px-4 py-3 font-semibold text-white">{formatPrice(p.prix)}</td>
                <td className="px-4 py-3 text-neutral-300">{p.stock}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    disabled={patch.isPending}
                    onClick={() => patch.mutate({ id: p.id, body: { featured: !p.featured } })}
                    className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase ${
                      p.featured ? 'bg-tiktok-cyan/15 text-tiktok-cyan' : 'bg-white/5 text-neutral-500'
                    }`}
                  >
                    {p.featured ? 'Oui' : 'Non'}
                  </button>
                </td>
                <td className="px-4 py-3 text-neutral-400">{p.status}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    disabled={patch.isPending}
                    onClick={() =>
                      patch.mutate({ id: p.id, body: { status: p.status === 'disponible' ? 'sold' : 'disponible' } })
                    }
                    className="text-xs text-neutral-300 hover:underline"
                    title="Toggle rapide dispo/vendu"
                  >
                    Basculer dispo/vendu
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && !isPending && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-neutral-500">
                  Aucun produit. Crée une tenue pour la publier côté clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

