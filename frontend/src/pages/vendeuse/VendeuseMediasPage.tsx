import { type ChangeEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FolderOpen, ImagePlus, Trash2 } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import type { MediaGallerySlot } from '../../types/domain';
import { STAFF_LIST_LIMIT } from '../../constants/apiPagination';
import { api } from '../../services/api';
import { absoluteMediaUrl } from '../../utils/mediaUrl';

/** Galeries affichées : robes & crop tops uniquement (+ autres si anciennes données live/banners). */
type ShopMediaSection = 'robes' | 'crops' | 'uncategorized';

const GALLERY_ORDER: ShopMediaSection[] = ['robes', 'crops', 'uncategorized'];

const IMPORT_SLOTS: ShopMediaSection[] = ['robes', 'crops', 'uncategorized'];

const GALLERY_META: Record<ShopMediaSection, { title: string; hint: string }> = {
  robes: {
    title: 'Robes',
    hint: 'Visuels robes du catalogue.',
  },
  crops: {
    title: 'Crop tops',
    hint: 'Visuels crop tops.',
  },
  uncategorized: {
    title: 'Autres / non classé',
    hint: 'Anciennes catégories ou fichiers à reclasser.',
  },
};

function slotForDisplay(gallery: string): ShopMediaSection {
  if (gallery === 'robes' || gallery === 'crops') return gallery;
  return 'uncategorized';
}

type MediaRow = {
  id: string;
  url: string;
  filename: string;
  gallery: string;
  isPrimary: boolean;
  createdAt: string;
};

const VendeuseMediasPage = () => {
  const qc = useQueryClient();
  const [defaultSlot, setDefaultSlot] = useState<ShopMediaSection>('robes');

  const listQ = useQuery({
    queryKey: ['media'],
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
      fd.append('gallery', defaultSlot as MediaGallerySlot);
      fd.append('isPrimary', 'false');
      await api.post('/media', fd);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });

  const deleteM = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/media/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });

  const onFiles = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    Array.from(files).forEach((f) => uploadM.mutate(f));
    e.target.value = '';
  };

  const items = listQ.data ?? [];
  const byGallery = new Map<ShopMediaSection, MediaRow[]>();
  for (const g of GALLERY_ORDER) byGallery.set(g, []);
  for (const m of items) {
    const g = slotForDisplay(m.gallery);
    const list = byGallery.get(g) ?? [];
    list.push(m);
    byGallery.set(g, list);
  }

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Médiathèque"
        description="Liste, envoi et suppression connectés à l’API (fichiers sur le serveur)."
      />

      {listQ.error && (
        <p className="mb-4 text-sm text-red-300">{String(listQ.error)}</p>
      )}

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-[#111] p-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase text-neutral-500">
            Galerie à l’import
          </label>
          <select
            value={defaultSlot}
            onChange={(e) => setDefaultSlot(e.target.value as ShopMediaSection)}
            className="rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-tiktok-pink/50 focus:outline-none"
          >
            {IMPORT_SLOTS.map((g) => (
              <option key={g} value={g}>
                {GALLERY_META[g].title}
              </option>
            ))}
          </select>
        </div>
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-white/20 bg-[#0c0c0c] px-5 py-3 text-sm font-semibold text-white transition hover:border-tiktok-pink/50">
          <ImagePlus className="h-5 w-5 text-tiktok-pink" strokeWidth={2} />
          Importer des images
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={onFiles}
          />
        </label>
        <button
          type="button"
          onClick={() => void listQ.refetch()}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-500 hover:text-white"
        >
          Actualiser
        </button>
      </div>

      {GALLERY_ORDER.map((slot) => {
        const list = byGallery.get(slot) ?? [];
        if (list.length === 0) return null;
        const meta = GALLERY_META[slot];
        return (
          <section key={slot} className="mb-12">
            <div className="mb-4 flex items-start gap-3">
              <FolderOpen className="mt-0.5 h-5 w-5 text-tiktok-cyan" strokeWidth={2} aria-hidden />
              <div>
                <h2 className="text-lg font-bold text-white">{meta.title}</h2>
                <p className="text-xs text-neutral-500">{meta.hint}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {list.map((m) => (
                <figure
                  key={m.id}
                  className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111]"
                >
                  <div className="aspect-[3/4] w-full overflow-hidden bg-[#1a1a1a]">
                    <img src={absoluteMediaUrl(m.url)} alt="" className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="space-y-2 p-3">
                    <p className="truncate text-xs font-medium text-white">{m.filename}</p>
                    {m.isPrimary && (
                      <p className="text-[10px] font-bold uppercase text-tiktok-pink">Principale</p>
                    )}
                    <button
                      type="button"
                      disabled={deleteM.isPending}
                      onClick={() => {
                        if (window.confirm('Supprimer ce média sur le serveur ?')) deleteM.mutate(m.id);
                      }}
                      className="flex w-full items-center justify-center gap-1 rounded-lg border border-red-500/30 py-1.5 text-[10px] font-bold uppercase text-red-400 hover:bg-red-500/10"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                      Supprimer
                    </button>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}

      {items.length === 0 && !listQ.isPending && (
        <p className="rounded-xl border border-white/10 bg-[#111] p-8 text-center text-sm text-neutral-500">
          Aucun média. Importe des fichiers ci-dessus.
        </p>
      )}

      {listQ.isPending && (
        <p className="text-center text-sm text-neutral-500">Chargement…</p>
      )}
    </div>
  );
};

export default VendeuseMediasPage;
