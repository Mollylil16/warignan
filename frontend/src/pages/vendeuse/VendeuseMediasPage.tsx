import { useCallback, useState, type ChangeEvent } from 'react';
import { ImagePlus, Star, Trash2 } from 'lucide-react';
import PageHeader from '../../components/vendeuse/PageHeader';
import { mockMediaAssets, type MockMediaAsset } from '../../data/vendeuseMock';

const VendeuseMediasPage = () => {
  const [items, setItems] = useState<MockMediaAsset[]>(() => [...mockMediaAssets]);

  const remove = (id: string) => setItems((prev) => prev.filter((m) => m.id !== id));

  const setPrimary = (id: string) => {
    setItems((prev) => prev.map((m) => ({ ...m, isPrimary: m.id === id })));
  };

  const onFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    const f = files[0];
    const url = URL.createObjectURL(f);
    const id = `local-${Date.now()}`;
    setItems((prev) => [
      {
        id,
        url,
        filename: f.name,
        isPrimary: prev.length === 0,
        context: 'Brouillon local',
      },
      ...prev,
    ]);
    e.target.value = '';
  }, []);

  return (
    <div className="max-w-6xl">
      <PageHeader
        title="Images du site"
        description="Grille des visuels (public/). Upload en preview locale ; suppression et image principale."
      />

      <label className="mb-8 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/15 bg-[#111] px-6 py-12 transition hover:border-tiktok-pink/40 hover:bg-[#141414]">
        <ImagePlus className="mb-2 h-10 w-10 text-neutral-500" strokeWidth={1.5} />
        <span className="text-sm font-semibold text-white">Cliquer pour ajouter une image</span>
        <span className="mt-1 text-xs text-neutral-500">Preview locale seulement</span>
        <input type="file" accept="image/*" className="sr-only" onChange={onFile} />
      </label>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((m) => (
          <figure
            key={m.id}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#111]"
          >
            <div className="aspect-[3/4] w-full overflow-hidden bg-[#1a1a1a]">
              <img src={m.url} alt="" className="h-full w-full object-cover" />
            </div>
            <figcaption className="p-3">
              <p className="truncate text-xs font-medium text-white">{m.filename}</p>
              <p className="truncate text-[10px] text-neutral-500">{m.context}</p>
              <div className="mt-2 flex gap-2">
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
                  onClick={() => remove(m.id)}
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
    </div>
  );
};

export default VendeuseMediasPage;
