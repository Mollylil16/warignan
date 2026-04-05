import { Product, ProductStatus } from '../../types';
import { useCartStore } from '../../stores/cartStore';
import { formatPriceParts } from '../../utils/formatPrice';
import StockBadge from '../ui/stockBadge';
import ProductImageCarousel from './ProductImageCarousel';

// Props du composant : il reçoit un objet Product complet
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const addToReserve = useCartStore((s) => s.addToReserve);
  const addToOrder = useCartStore((s) => s.addToOrder);

  // On sépare le prix en deux : "12 500" et "FCFA"
  // pour pouvoir les styler différemment
  const { amount, currency } = formatPriceParts(product.prix);

  // Booléen qui dit si le produit est réservé ou vendu (donc non dispo)
  const isUnavailable =
    product.status === ProductStatus.RESERVER ||
    product.status === ProductStatus.SOLD;

  const handleCommander = () => {
    addToOrder(product);
  };

  const handleReserver = () => {
    addToReserve(product);
  };

  return (
    <article
      className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#080808] pb-3 shadow-[0_8px_32px_rgba(0,0,0,0.45)] transition-[border-color,box-shadow] duration-300 hover:border-white/[0.12] sm:pb-4"
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

        {/* Code produit en haut à gauche (ex: #R-042) */}
        <div
          className="absolute left-2 top-2 z-20 px-1.5 py-0.5 text-[10px] font-bold sm:left-4 sm:top-4 sm:px-2 sm:py-1 sm:text-xs"
          style={{
            background: '#FFFFFF',
            color: '#050505',
            fontFamily: "'Space Grotesk', sans-serif",
          }}
        >
          {product.code}
        </div>

        {/* Badge de stock (Disponible / Réservé / Dernier !) */}
        <StockBadge status={product.status} stock={product.stock} />
      </div>

      {/* ---- Infos produit (hauteur mini pour aligner les lignes de grille) ---- */}
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

      <div className="grid grid-cols-2 gap-2 px-3 pb-2 sm:gap-2 sm:px-4 sm:pb-3 md:gap-2.5">
        {/* Bouton RÉSERVER */}
        <button
          type="button"
          onClick={handleReserver}
          disabled={isUnavailable}
          className="rounded px-0.5 py-1.5 text-center text-[11px] font-bold uppercase leading-snug tracking-wide transition-transform sm:px-1 sm:py-2 sm:text-xs sm:tracking-wider md:py-2.5 md:text-sm md:leading-normal"
          style={{
            background: 'transparent',
            border: isUnavailable
              ? '1px solid #444'
              : '1px solid #9146FF',
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
          className="rounded px-0.5 py-1.5 text-center text-[11px] font-bold uppercase leading-snug tracking-wide transition-transform sm:px-1 sm:py-2 sm:text-xs sm:tracking-wider md:py-2.5 md:text-sm md:leading-normal"
          style={{
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
    </article>
  );
};

export default ProductCard;