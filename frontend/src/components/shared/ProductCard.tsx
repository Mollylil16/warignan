
import { useNavigate } from 'react-router-dom';
import { Product, ProductStatus } from '../../types';
import { formatPriceParts } from '../../utils/formatPrice';
import StockBadge from '../ui/stockBadge';

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
      style={{ background: '#050505', paddingBottom: '16px' }}
      className="relative"
    >
      {/* ---- ZONE IMAGE ---- */}
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: '4/5', background: '#111' }}
      >
        {/* Code produit en haut à gauche (ex: #R-042) */}
        <div
          className="absolute top-4 left-4 z-10 px-2 py-1 text-xs font-bold"
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

        {/* Image principale du produit */}
        <img
          src={product.imageName[0]}  // On prend la première image du tableau
          alt={product.nom}
          className="w-full h-full object-cover"
          // Si le produit est réservé, on met l'image en gris
          style={
            product.status === ProductStatus.RESERVER
              ? { filter: 'grayscale(80%) brightness(0.8)' }
              : {}
          }
        />

        {/* Dégradé sombre en bas de l'image pour le style */}
        <div
          className="absolute bottom-0 left-0 w-full pointer-events-none"
          style={{
            height: '30%',
            // Dégradé du bas (sombre) vers le haut (transparent)
            background:
              'linear-gradient(0deg, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0) 100%)',
          }}
        />
      </div>

      {/* ---- ZONE INFOS PRODUIT ---- */}
      <div className="flex justify-between items-start gap-4 px-4 py-4">
        <div className="flex-1">
          {/* Nom du produit */}
          <h2
            className="text-base font-semibold mb-1"
            style={{ color: '#FFFFFF' }}
          >
            {product.nom}
          </h2>

          {/* Prix avec style spécial */}
          <div
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-1px',
            }}
          >
            {/* Le montant en grand */}
            {amount}{' '}
            {/* "FCFA" en petit et grisé */}
            <span style={{ fontSize: '14px', color: '#888', fontWeight: 500 }}>
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* ---- BOUTONS ACTION ---- */}
      <div className="grid grid-cols-2 gap-2 px-4">

        {/* Bouton RÉSERVER */}
        <button
          onClick={handleReserver}
          // Désactivé si le produit n'est pas disponible
          disabled={isUnavailable}
          style={{
            background: 'transparent',
            // Si dispo : bordure violette. Sinon : opacité réduite
            border: isUnavailable
              ? '1.5px solid #444'
              : '1.5px solid #9146FF',
            color: isUnavailable ? '#555' : '#9146FF',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            padding: '14px 0',
            borderRadius: '4px',
            cursor: isUnavailable ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            transition: 'transform 0.1s',
            opacity: isUnavailable ? 0.5 : 1,
          }}
        >
          {/* Texte différent selon le statut */}
          {product.status === ProductStatus.RESERVER ? 'En attente...' : 'Réserver'}
        </button>

        {/* Bouton COMMANDER */}
        <button
          onClick={handleCommander}
          disabled={isUnavailable}
          style={{
            // Si dispo : fond rose TikTok. Sinon : fond gris
            background: isUnavailable ? '#2A2A2A' : '#FE2C55',
            color: isUnavailable ? '#888' : '#FFFFFF',
            border: 'none',
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            fontSize: '14px',
            padding: '14px 0',
            borderRadius: '4px',
            cursor: isUnavailable ? 'not-allowed' : 'pointer',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            transition: 'transform 0.1s',
          }}
        >
          {isUnavailable ? 'Indisponible' : 'Commander'}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;