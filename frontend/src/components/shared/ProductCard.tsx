
import { useNavigate } from 'react-router-dom';
import { Product, ProductStatus } from '../../types';
import { formatPriceParts } from '../../utils/formatPrice';
import StockBadge from '../ui/stockBadge';
import ProductImageCarousel from './ProductImageCarousel';

// Props du composant : il reçoit un objet Product complet
interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // useNavigate = hook React Router pour naviguer vers une autre page
  const navigate = useNavigate();

  // On sépare le prix en deux : "12 500" et "FCFA"
  // pour pouvoir les styler différemment
  const { amount, currency } = formatPriceParts(product.prix);

  // Booléen qui dit si le produit est réservé ou vendu (donc non dispo)
  const isUnavailable =
    product.status === ProductStatus.RESERVER ||
    product.status === ProductStatus.SOLD;

  // Quand on clique sur "Commander" → aller vers /commander avec l'ID du produit
  const handleCommander = () => {
    navigate(`/commander/${product.id}`);
  };

  // Quand on clique sur "Réserver" → aller vers /reserver avec l'ID du produit
  const handleReserver = () => {
    navigate(`/reserver/${product.id}`);
  };

  return (
    // article = balise HTML sémantique pour un élément de contenu indépendant
    <article
      className="relative pb-3 sm:pb-4"
      style={{ background: '#050505' }}
    >
      {/* ---- ZONE IMAGE (carrousel type Pinterest + image moins zoomée) ---- */}
      <div
        className="relative w-full overflow-hidden rounded-t-md sm:rounded-t-lg"
        style={{ aspectRatio: '4/5', background: '#111' }}
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

      {/* ---- ZONE INFOS PRODUIT ---- */}
      <div className="flex items-start justify-between gap-2 px-2 py-2.5 sm:gap-4 sm:px-4 sm:py-4">
        <div className="min-w-0 flex-1">
          {/* Nom du produit */}
          <h2
            className="mb-0.5 line-clamp-2 text-xs font-semibold sm:mb-1 sm:text-base"
            style={{ color: '#FFFFFF' }}
          >
            {product.nom}
          </h2>

          {/* Prix avec style spécial */}
          <div
            className="text-lg font-bold tracking-tight sm:text-2xl"
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              color: '#FFFFFF',
            }}
          >
            {amount}{' '}
            <span className="text-[11px] font-medium text-[#888] sm:text-sm">
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* ---- BOUTONS ACTION (compacts sur mobile, taille confortable à partir de md) ---- */}
      <div className="grid grid-cols-2 gap-1 px-2 pb-1 sm:gap-1.5 sm:px-4 md:gap-2 md:pb-0">
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