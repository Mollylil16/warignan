import { useCallback, useEffect, useRef, useState } from 'react';

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  isGrayscale: boolean;
}

/**
 * Carrousel horizontal : swipe natif, snap, pastilles en bas.
 * object-cover + cadre fixe pour une grille de cartes alignée et homogène.
 */
const ProductImageCarousel = ({
  images,
  alt,
  isGrayscale,
}: ProductImageCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const slides = images.filter((u) => typeof u === 'string' && u.trim() !== '');

  const syncActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || slides.length <= 1) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    const idx = Math.round(el.scrollLeft / w);
    setActive(Math.min(Math.max(0, idx), slides.length - 1));
  }, [slides.length]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', syncActiveFromScroll, { passive: true });
    return () => el.removeEventListener('scroll', syncActiveFromScroll);
  }, [syncActiveFromScroll]);

  const goTo = (index: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    el.scrollTo({ left: index * w, behavior: 'smooth' });
  };

  if (slides.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#111] text-[11px] text-[#666]">
        Pas d&apos;image
      </div>
    );
  }

  const imgFilter = isGrayscale
    ? 'grayscale(80%) brightness(0.8)'
    : undefined;

  return (
    <div className="relative h-full w-full">
      <div
        ref={scrollRef}
        className="relative z-0 flex h-full w-full snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {slides.map((src, i) => (
          <div
            key={`${src}-${i}`}
            className="relative h-full min-w-full shrink-0 snap-center overflow-hidden bg-[#0a0a0a]"
          >
            <img
              src={src}
              alt={`${alt} — ${i + 1}`}
              className="h-full w-full select-none object-cover object-center"
              style={imgFilter ? { filter: imgFilter } : undefined}
              draggable={false}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {/* Dégradé au-dessus des photos, sous les pastilles */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 z-[8] h-[28%] w-full"
        style={{
          background:
            'linear-gradient(0deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0) 100%)',
        }}
        aria-hidden
      />

      {slides.length > 1 && (
        <div
          className="pointer-events-none absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-1.5 px-2"
          role="tablist"
          aria-label="Photos du produit"
        >
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Photo ${i + 1} sur ${slides.length}`}
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-200 ${
                i === active ? 'w-4 bg-white' : 'w-1.5 bg-white/35 hover:bg-white/55'
              }`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageCarousel;
