import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Product, ProductStatus } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { formatPriceParts } from '../../utils/formatPrice';
import StockBadge from '../ui/stockBadge';
import ProductImageCarousel from './ProductImageCarousel';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const addToReserve = useCartStore((s) => s.addToReserve);
  const addToOrder = useCartStore((s) => s.addToOrder);

  const [isLiked, setIsLiked] = useState(() => {
    try {
      return localStorage.getItem(`like:${product.id}`) === 'true';
    } catch {
      return false;
    }
  });
  const [justLiked, setJustLiked] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const { amount, currency } = formatPriceParts(product.prix);

  const isUnavailable =
    product.status === ProductStatus.RESERVER ||
    product.status === ProductStatus.SOLD;

  const handleCommander = () => {
    addToOrder(product);
  };

  const handleReserver = () => {
    addToReserve(product);
  };

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextVal = !isLiked;
    setIsLiked(nextVal);
    if (nextVal) {
      setJustLiked(true);
    }
    try {
      localStorage.setItem(`like:${product.id}`, String(nextVal));
    } catch {
      // Ignore storage errors
    }
  };

  const delay = index !== undefined ? `${(index % 4) * 80}ms` : '0ms';

  return (
    <div
      ref={cardRef}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{
        transitionDelay: isVisible ? delay : '0ms',
      }}
    >
      <article
        className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#1A1718] pb-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12] sm:pb-4"
        style={{ boxSizing: 'border-box' }}
      >
        {/* ---- Zone image (ratio fixe, remplissage uniforme) ---- */}
        <div
          className="relative w-full overflow-hidden bg-[#111]"
          style={{ aspectRatio: '3 / 4' }}
        >
          <div className="absolute inset-0 z-10 min-h-0">
            <ProductImageCarousel
              images={product.imageName}
              alt={product.nom}
              isGrayscale={product.status === ProductStatus.RESERVER}
            />
          </div>

          {/* Code produit en haut à gauche */}
          <div
            className="absolute left-2 top-2 z-20 flex flex-wrap items-center gap-1 sm:left-4 sm:top-4"
          >
            <div
              className="px-1.5 py-0.5 text-[10px] font-bold sm:px-2 sm:py-1 sm:text-xs"
              style={{
                background: '#FFFFFF',
                color: '#050505',
                fontFamily: "'Space Grotesk', sans-serif",
              }}
            >
              {product.code}
            </div>
            {product.featured && (
              <span className="rounded bg-tiktok-pink/95 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wide text-white sm:text-[10px] animate-badge-pulse">
                Live pick
              </span>
            )}
          </div>

          {/* Bouton Favoris (Cœur) en haut à droite */}
          <button
            type="button"
            onClick={toggleLike}
            className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-white transition hover:bg-black/75 hover:scale-105 active:scale-95 sm:right-4 sm:top-4 sm:h-8 sm:w-8"
            aria-label="Ajouter aux favoris"
          >
            <Heart
              className={`h-4 w-4 transition-all ${
                isLiked
                  ? 'fill-tiktok-pink text-tiktok-pink animate-heart-beat'
                  : 'text-neutral-300'
              } ${justLiked ? 'animate-scale-bounce' : ''}`}
              onAnimationEnd={() => setJustLiked(false)}
            />
          </button>

          {/* Badge de stock */}
          <StockBadge status={product.status} stock={product.stock} />
        </div>

        {/* ---- Infos produit ---- */}
        <div className="flex items-start justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-4 sm:py-4">
          <div className="flex min-h-[4.25rem] min-w-0 flex-1 flex-col justify-between sm:min-h-[4.75rem]">
            <h2
              className="mb-1 line-clamp-2 text-xs font-semibold leading-snug text-white sm:text-[0.95rem]"
            >
              {product.nom}
            </h2>
            <div
              className="text-lg font-bold tracking-tight text-white sm:text-2xl"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {amount}{' '}
              <span className="text-[11px] font-medium text-neutral-500 sm:text-sm">
                {currency}
              </span>
            </div>
          </div>
        </div>

        {/* Zone boutons */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'nowrap',
            gap: '8px',
            width: '100%',
            padding: '0 12px 8px',
            boxSizing: 'border-box',
          }}
        >
          {/* Bouton RÉSERVER */}
          <button
            type="button"
            onClick={handleReserver}
            disabled={isUnavailable}
            style={{
              flex: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)',
              padding: '10px 4px',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: '4px',
              background: 'transparent',
              border: isUnavailable ? '1px solid #444' : '1px solid #9146FF',
              color: isUnavailable ? '#555' : '#9146FF',
              fontFamily: 'Inter, sans-serif',
              cursor: isUnavailable ? 'not-allowed' : 'pointer',
              opacity: isUnavailable ? 0.5 : 1,
            }}
          >
            {product.status === ProductStatus.RESERVER ? 'En attente...' : 'Réserver'}
          </button>

          {/* Bouton COMMANDER */}
          <button
            type="button"
            onClick={handleCommander}
            disabled={isUnavailable}
            style={{
              flex: 1,
              minWidth: 0,
              whiteSpace: 'nowrap',
              fontSize: 'clamp(0.65rem, 2.5vw, 0.8rem)',
              padding: '10px 4px',
              textAlign: 'center',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              borderRadius: '4px',
              background: isUnavailable ? '#2A2A2A' : '#FE2C55',
              color: isUnavailable ? '#888' : '#FFFFFF',
              border: 'none',
              fontFamily: 'Inter, sans-serif',
              cursor: isUnavailable ? 'not-allowed' : 'pointer',
            }}
          >
            {isUnavailable ? 'Indisponible' : 'Commander'}
          </button>
        </div>

        <div className="flex justify-center gap-3 px-3 pb-2 text-[10px] font-semibold sm:text-[11px]">
          <Link
            to={`/commander/${product.id}`}
            className="text-tiktok-pink/90 underline-offset-2 hover:underline"
          >
            Fiche commande
          </Link>
          <span className="text-neutral-700" aria-hidden>
            |
          </span>
          <Link
            to={`/reserver/${product.id}`}
            className="text-reserve-purple/90 underline-offset-2 hover:underline"
          >
            Fiche réservation
          </Link>
        </div>
      </article>
    </div>
  );
};

export default ProductCard;