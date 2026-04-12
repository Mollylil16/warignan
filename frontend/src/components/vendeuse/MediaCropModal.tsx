import { useCallback, useEffect, useRef, useState } from 'react';
import { Minus, Plus, X } from 'lucide-react';

const PREVIEW_W = 360;
const PREVIEW_H = 480;
const EXPORT_W = 900;
const EXPORT_H = 1200;

interface MediaCropModalProps {
  imageSrc: string;
  filename: string;
  onClose: () => void;
  onApply: (dataUrl: string, filename: string) => void;
}

/**
 * Recadrage 3:4 (canvas) : zoom + déplacement, export JPEG pour le catalogue.
 */
const MediaCropModal = ({ imageSrc, filename, onClose, onApply }: MediaCropModalProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bitmap, setBitmap] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const dragRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  }>({ active: false, startX: 0, startY: 0, originX: 0, originY: 0 });

  useEffect(() => {
    const img = new Image();
    if (!imageSrc.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => setBitmap(img);
    img.onerror = () => setBitmap(null);
    img.src = imageSrc;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = bitmap;
    if (!canvas || !img || img.naturalWidth === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const base = Math.max(PREVIEW_W / iw, PREVIEW_H / ih);
    const scale = base * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    const x = (PREVIEW_W - dw) / 2 + pan.x;
    const y = (PREVIEW_H - dh) / 2 + pan.y;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, PREVIEW_W, PREVIEW_H);
    ctx.drawImage(img, x, y, dw, dh);
  }, [bitmap, zoom, pan]);

  useEffect(() => {
    draw();
  }, [draw]);

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.06 : 0.06;
    setZoom((z) => Math.min(3, Math.max(1, Math.round((z + delta) * 100) / 100)));
  };

  const exportCrop = () => {
    const img = bitmap;
    if (!img || img.naturalWidth === 0) return;
    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_W;
    canvas.height = EXPORT_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const base = Math.max(PREVIEW_W / iw, PREVIEW_H / ih);
    const scale = base * zoom;
    const dw = iw * scale;
    const dh = ih * scale;
    const x = (PREVIEW_W - dw) / 2 + pan.x;
    const y = (PREVIEW_H - dh) / 2 + pan.y;
    const factor = EXPORT_W / PREVIEW_W;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, EXPORT_W, EXPORT_H);
    ctx.drawImage(img, x * factor, y * factor, dw * factor, dh * factor);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const baseName = filename.replace(/\.[^.]+$/, '');
    onApply(dataUrl, `${baseName}-recadre.jpg`);
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/80 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="crop-title"
    >
      <div className="max-h-[95vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="crop-title" className="text-lg font-bold text-white">
            Recadrer (3:4)
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-neutral-500">
          Glisse pour cadrer (robe, crop, accessoire). Molette ou boutons pour zoomer. Export haute
          définition pour le catalogue — upload S3 / CDN viendra avec le backend.
        </p>

        {!bitmap && (
          <p className="py-12 text-center text-sm text-neutral-500">Chargement de l’image…</p>
        )}

        {bitmap && (
          <>
            <div
              className="relative mx-auto overflow-hidden rounded-xl border border-white/10 bg-black"
              style={{ width: PREVIEW_W, height: PREVIEW_H }}
              onWheel={onWheel}
            >
              <canvas
                ref={canvasRef}
                width={PREVIEW_W}
                height={PREVIEW_H}
                className="block touch-none"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture(e.pointerId);
                  dragRef.current = {
                    active: true,
                    startX: e.clientX,
                    startY: e.clientY,
                    originX: pan.x,
                    originY: pan.y,
                  };
                }}
                onPointerMove={(e) => {
                  const d = dragRef.current;
                  if (!d.active) return;
                  setPan({
                    x: d.originX + (e.clientX - d.startX),
                    y: d.originY + (e.clientY - d.startY),
                  });
                }}
                onPointerUp={(e) => {
                  try {
                    e.currentTarget.releasePointerCapture(e.pointerId);
                  } catch {
                    /* ignore */
                  }
                  dragRef.current.active = false;
                }}
              />
            </div>

            <div className="mt-3 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, Math.round((z - 0.1) * 100) / 100))}
                className="rounded-lg border border-white/15 p-2 text-white hover:bg-white/10"
                aria-label="Zoom arrière"
              >
                <Minus className="h-4 w-4" strokeWidth={2} />
              </button>
              <span className="min-w-[3rem] text-center text-sm text-neutral-400">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.1) * 100) / 100))}
                className="rounded-lg border border-white/15 p-2 text-white hover:bg-white/10"
                aria-label="Zoom avant"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={exportCrop}
                className="flex-1 rounded-xl bg-tiktok-pink py-3 text-sm font-bold text-white hover:brightness-110"
              >
                Appliquer le recadrage
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-semibold text-neutral-300 hover:bg-white/5"
              >
                Annuler
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaCropModal;
