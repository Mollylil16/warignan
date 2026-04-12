import { useCallback, useMemo, useState, type ChangeEvent } from 'react';
import { FolderOpen, ImagePlus, Scissors, Star, Trash2 } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import MediaCropModal from '../../components/vendeuse/MediaCropModal';
import {
  useMediaLibraryStore,
  type MediaLibraryItem,
} from '../../stores/mediaLibraryStore';
import type { MediaGallerySlot } from '../../data/vendeuseMock';

const GALLERY_ORDER: MediaGallerySlot[] = ['robes', 'crops', 'live', 'banners', 'uncategorized'];

const GALLERY_META: Record<
  MediaGallerySlot,
  { title: string; hint: string }
> = {
  robes: {
    title: 'Robes & pièces longues',
    hint: 'Visuels 3:4 pour la grille catalogue — idéalement fond neutre.',
  },
  crops: {
    title: 'Crops & chaussures',
    hint: 'Même cadrage que les robes pour un feed homogène.',
  },
  live: {
    title: 'Live & reels',
    hint: 'Captures verticales 9:16 possibles ; le recadrage 3:4 centre le sujet.',
  },
  banners: {
    title: 'Bannières & mise en avant',
    hint: 'Pour la home et les campagnes (le backend servira les bons formats).',
  },
  uncategorized: {
    title: 'Non classé',
    hint: 'Classe les médias avant publication.',
  },
};

const VendeuseMediasPage = () => {
  const items = useMediaLibraryStore((s) => s.items);
  const addItem = useMediaLibraryStore((s) => s.addItem);
  const removeItem = useMediaLibraryStore((s) => s.removeItem);
  const setPrimary = useMediaLibraryStore((s) => s.setPrimary);
  const setGallery = useMediaLibraryStore((s) => s.setGallery);
  const updateItemUrl = useMediaLibraryStore((s) => s.updateItemUrl);
  const resetToSeed = useMediaLibraryStore((s) => s.resetToSeed);

  const [defaultSlot, setDefaultSlot] = useState<MediaGallerySlot>('robes');
  const [cropTarget, setCropTarget] = useState<MediaLibraryItem | null>(null);

  const byGallery = useMemo(() => {
    const map = new Map<MediaGallerySlot, MediaLibraryItem[]>();
    for (const g of GALLERY_ORDER) map.set(g, []);
    for (const m of items) {
      const g = m.gallery ?? 'uncategorized';
      const list = map.get(g) ?? [];
      list.push(m);
      map.set(g, list);
    }
    return map;
  }, [items]);

  const onFiles = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files?.length) return;
      const startEmpty = items.length === 0;
      Array.from(files).forEach((f, i) => {
        const url = URL.createObjectURL(f);
        const id = `local-${Date.now()}-${i}`;
        const item: MediaLibraryItem = {
          id,
          url,
          filename: f.name,
          isPrimary: startEmpty && i === 0,
          context:
            defaultSlot === 'robes'
              ? 'Catalogue — Robes'
              : defaultSlot === 'crops'
                ? 'Catalogue — Crops'
                : defaultSlot === 'live'
                  ? 'Live & reels'
                  : defaultSlot === 'banners'
                    ? 'Bannières & home'
                    : 'Non classé',
          gallery: defaultSlot,
        };
        addItem(item);
      });
      e.target.value = '';
    },
    [addItem, defaultSlot, items.length]
  );

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Médiathèque"
        description="Ajoute des photos, classe-les par usage (robes, crops, live, bannières), recadre en 3:4 et définis l’image principale. Tout est stocké localement jusqu’à l’API upload."
      />

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-white/10 bg-[#111] p-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase text-neutral-500">
            Emplacement par défaut
          </label>
          <select
            value={defaultSlot}
            onChange={(e) => setDefaultSlot(e.target.value as MediaGallerySlot)}
            className="rounded-lg border border-white/15 bg-[#0a0a0a] px-3 py-2 text-sm text-white focus:border-tiktok-pink/50 focus:outline-none"
          >
            {GALLERY_ORDER.map((g) => (
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
          onClick={() => {
            if (window.confirm('Réinitialiser la médiathèque aux images de démo ?')) resetToSeed();
          }}
          className="rounded-lg border border-white/15 px-3 py-2 text-xs text-neutral-500 hover:text-white"
        >
          Réinitialiser la démo
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
                    <img src={m.url} alt="" className="h-full w-full object-cover" />
                  </div>
                  <figcaption className="space-y-2 p-3">
                    <p className="truncate text-xs font-medium text-white">{m.filename}</p>
                    <select
                      value={m.gallery ?? 'uncategorized'}
                      onChange={(e) => setGallery(m.id, e.target.value as MediaGallerySlot)}
                      className="w-full rounded border border-white/10 bg-black/50 py-1.5 text-[11px] text-white"
                    >
                      {GALLERY_ORDER.map((g) => (
                        <option key={g} value={g}>
                          {GALLERY_META[g].title}
                        </option>
                      ))}
                    </select>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setCropTarget(m)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 py-1.5 text-[10px] font-bold uppercase text-neutral-300 hover:bg-white/5"
                      >
                        <Scissors className="h-3.5 w-3.5" strokeWidth={2} />
                        Recadrer
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrimary(m.id)}
                        className={`flex flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold uppercase ${
                          m.isPrimary
                            ? 'bg-tiktok-pink text-white'
                            : 'border border-white/15 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Star className={`h-3.5 w-3.5 ${m.isPrimary ? 'fill-white' : ''}`} strokeWidth={2} />
                        Principale
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (m.url.startsWith('blob:')) URL.revokeObjectURL(m.url);
                          removeItem(m.id);
                        }}
                        className="rounded-lg border border-red-500/30 p-1.5 text-red-400 hover:bg-red-500/10"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={2} />
                      </button>
                    </div>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>
        );
      })}

      {items.length === 0 && (
        <p className="rounded-xl border border-white/10 bg-[#111] p-8 text-center text-sm text-neutral-500">
          Aucun média. Importe des fichiers ci-dessus ou réinitialise la démo.
        </p>
      )}

      {cropTarget && (
        <MediaCropModal
          imageSrc={cropTarget.url}
          filename={cropTarget.filename}
          onClose={() => setCropTarget(null)}
          onApply={(dataUrl, fname) => {
            if (cropTarget.url.startsWith('blob:')) URL.revokeObjectURL(cropTarget.url);
            updateItemUrl(cropTarget.id, dataUrl, fname);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default VendeuseMediasPage;
