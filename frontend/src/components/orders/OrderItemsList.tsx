import { useState } from 'react';
import { Eye, ShoppingBag, X } from 'lucide-react';
import type { OrderItemDetail } from '../../types/domain';
import { absoluteMediaUrl } from '../../utils/mediaUrl';
import { formatPrice } from '../../utils/formatPrice';

export interface OrderItemsListProps {
  items?: OrderItemDetail[];
  summary?: string;
  variant?: 'compact' | 'cards' | 'drawer';
  className?: string;
}

/** Fallback de parsing client pour "CR-ABC ×2, RB-XYZ ×1" */
function parseSummaryFallback(summary?: string): OrderItemDetail[] {
  if (!summary) return [];
  return summary
    .split(',')
    .map((part) => part.trim())
    .flatMap((part) => {
      const m = part.match(/^(\S+)\s+×(\d+)$/u);
      if (!m) return [];
      return [
        {
          code: m[1],
          qty: parseInt(m[2], 10),
          nom: null,
          prix: null,
          image: null,
          images: [],
        },
      ];
    });
}

export const OrderItemsList = ({
  items,
  summary,
  variant = 'cards',
  className = '',
}: OrderItemsListProps) => {
  const [activePreview, setActivePreview] = useState<OrderItemDetail | null>(null);
  const [brokenImages, setBrokenImages] = useState<Record<string, boolean>>({});

  const displayItems =
    items && items.length > 0 ? items : parseSummaryFallback(summary);

  if (displayItems.length === 0 && !summary) {
    return null;
  }

  const handleImageError = (code: string) => {
    setBrokenImages((prev) => ({ ...prev, [code]: true }));
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Liste des cartes / vignettes d'articles */}
      <div
        className={`flex flex-wrap gap-2.5 ${
          variant === 'drawer' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : ''
        }`}
      >
        {displayItems.map((item, idx) => {
          const hasImage = Boolean(item.image && !brokenImages[item.code]);
          const imageUrl = item.image ? absoluteMediaUrl(item.image) : '';

          if (variant === 'drawer') {
            return (
              <div
                key={`${item.code}-${idx}`}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#161616] p-3 transition hover:border-white/20"
              >
                {/* Image du produit */}
                <div
                  onClick={() => hasImage && setActivePreview(item)}
                  className={`group relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black/50 ${
                    hasImage ? 'cursor-pointer' : ''
                  }`}
                  title={hasImage ? "Cliquer pour agrandir la photo de l'article" : undefined}
                >
                  {hasImage ? (
                    <>
                      <img
                        src={imageUrl}
                        alt={item.nom ?? item.code}
                        onError={() => handleImageError(item.code)}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <Eye className="h-5 w-5 text-white" strokeWidth={2} />
                      </div>
                    </>
                  ) : (
                    <ShoppingBag className="h-8 w-8 text-neutral-600" strokeWidth={1.5} />
                  )}
                </div>

                {/* Détails du produit */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-tiktok-cyan">
                      {item.code}
                    </span>
                    <span className="rounded bg-tiktok-pink/20 px-1.5 py-0.5 text-[11px] font-bold text-tiktok-pink">
                      ×{item.qty}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-white">
                    {item.nom || 'Article Warignan'}
                  </p>
                  {item.prix != null && item.prix > 0 && (
                    <p className="mt-0.5 text-xs text-neutral-400">
                      {formatPrice(item.prix)} / unité
                    </p>
                  )}
                </div>
              </div>
            );
          }

          if (variant === 'compact') {
            return (
              <div
                key={`${item.code}-${idx}`}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2.5 py-1.5"
              >
                <div
                  onClick={() => hasImage && setActivePreview(item)}
                  className={`relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-neutral-900 ${
                    hasImage ? 'cursor-pointer hover:border-tiktok-cyan/50' : ''
                  }`}
                >
                  {hasImage ? (
                    <img
                      src={imageUrl}
                      alt={item.nom ?? item.code}
                      onError={() => handleImageError(item.code)}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ShoppingBag className="h-4 w-4 text-neutral-600" strokeWidth={1.5} />
                  )}
                </div>
                <div className="min-w-0 text-xs">
                  <span className="font-mono font-semibold text-tiktok-cyan">{item.code}</span>
                  <span className="ml-1.5 font-bold text-white">×{item.qty}</span>
                </div>
              </div>
            );
          }

          // Default: cards variant (pour les listes de commandes vendeuse)
          return (
            <div
              key={`${item.code}-${idx}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-gradient-to-b from-[#181818] to-[#121212] p-2.5 shadow-sm transition hover:border-white/20"
            >
              {/* Vignette photo */}
              <div
                onClick={() => hasImage && setActivePreview(item)}
                className={`group relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-black/60 shadow-inner ${
                  hasImage ? 'cursor-pointer ring-offset-black transition hover:ring-2 hover:ring-tiktok-cyan' : ''
                }`}
                title={hasImage ? "Cliquer pour agrandir la photo de l'article" : undefined}
              >
                {hasImage ? (
                  <>
                    <img
                      src={imageUrl}
                      alt={item.nom ?? item.code}
                      onError={() => handleImageError(item.code)}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Eye className="h-4 w-4 text-white" strokeWidth={2} />
                    </div>
                  </>
                ) : (
                  <ShoppingBag className="h-6 w-6 text-neutral-600" strokeWidth={1.5} />
                )}
              </div>

              {/* Textes & Code */}
              <div className="min-w-0 pr-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-tiktok-cyan">
                    {item.code}
                  </span>
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    ×{item.qty}
                  </span>
                </div>
                <p className="mt-0.5 max-w-[170px] truncate text-xs font-medium text-neutral-200">
                  {item.nom || 'Article Warignan'}
                </p>
                {item.prix != null && item.prix > 0 && (
                  <p className="text-[11px] text-neutral-400">
                    {formatPrice(item.prix)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Modal d'agrandissement de photo */}
      {activePreview && (
        <div
          role="presentation"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setActivePreview(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-2xl border border-white/15 bg-[#121212] p-4 text-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <span className="font-mono text-sm font-bold text-tiktok-cyan">
                  {activePreview.code}
                </span>
                <span className="ml-2 rounded-full bg-tiktok-pink/20 px-2 py-0.5 text-xs font-bold text-tiktok-pink">
                  Qté : {activePreview.qty}
                </span>
                <h3 className="text-base font-semibold text-white">
                  {activePreview.nom || 'Aperçu du vêtement'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white"
                aria-label="Fermer"
              >
                <X className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            {/* Photo grand format */}
            <div className="flex max-h-[65vh] items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-black">
              <img
                src={absoluteMediaUrl(activePreview.image ?? '')}
                alt={activePreview.nom ?? activePreview.code}
                className="max-h-[65vh] w-full object-contain"
              />
            </div>

            {activePreview.prix != null && activePreview.prix > 0 && (
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-400">
                <span>Prix unitaire : {formatPrice(activePreview.prix)}</span>
                <span>Total ligne : {formatPrice(activePreview.prix * activePreview.qty)}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
