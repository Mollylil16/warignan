import { Link } from 'react-router-dom';
import { Product, ProductStatus } from '../../types';
import { formatPriceParts } from '../../utils/formatPrice';
import StockBadge from '../ui/stockBadge';
import ProductImageCarousel from './ProductImageCarousel';

export type ProductActionIntent = 'order' | 'reserve';

interface ProductActionViewProps {
  product: Product;
  intent: ProductActionIntent;
  onAddToCart: () => void;
  inCart: boolean;
}

/**
 * Fiche produit partagée pour /commander/:id et /reserver/:id (panier + lien paiement).
 */
const ProductActionView = ({
  product,
  intent,
  onAddToCart,
  inCart,
}: ProductActionViewProps) => {
  const { amount, currency } = formatPriceParts(product.prix);
  const isUnavailable =
    product.status === ProductStatus.RESERVER || product.status === ProductStatus.SOLD;

  const isReserve = intent === 'reserve';
  const title = isReserve ? 'Réserver cette pièce' : 'Commander cette pièce';
  const cta = isReserve ? 'Ajouter au panier réservation' : 'Ajouter au panier commande';

  return (
    <main className="mx-auto max-w-lg px-4 py-8 text-white sm:max-w-xl sm:py-10">
      <Link
        to="/fouille"
        className="mb-6 inline-block text-sm font-semibold text-tiktok-cyan underline-offset-2 hover:underline"
      >
        ← Retour à la fouille
      </Link>

      <div
        className="relative mb-6 overflow-hidden rounded-xl border border-white/10 bg-[#111]"
        style={{ aspectRatio: '3 / 4' }}
      >
        <div className="absolute inset-0 z-10 min-h-0">
          <ProductImageCarousel
            images={product.imageName}
            alt={product.nom}
            isGrayscale={product.status === ProductStatus.RESERVER}
          />
        </div>
        <div
          className="absolute left-3 top-3 z-20 rounded px-2 py-1 text-xs font-bold text-[#050505]"
          style={{ background: '#fff', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {product.code}
        </div>
        <StockBadge status={product.status} stock={product.stock} />
      </div>

      <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
        {title}
      </p>
      <h1
        className="mb-2 text-2xl font-bold leading-tight sm:text-3xl"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {product.nom}
      </h1>
      <p className="mb-4 text-sm leading-relaxed text-neutral-400">{product.description}</p>

      <p className="mb-6 text-2xl font-bold text-white">
        {amount}{' '}
        <span className="text-sm font-medium text-neutral-500">{currency}</span>
      </p>

      <div className="space-y-3">
        <button
          type="button"
          disabled={isUnavailable}
          onClick={onAddToCart}
          className={`w-full rounded-xl py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 ${
            isReserve ? 'bg-reserve-purple' : 'bg-tiktok-pink'
          }`}
        >
          {isUnavailable ? 'Indisponible' : cta}
        </button>

        {inCart && !isUnavailable && (
          <Link
            to={isReserve ? '/paiement/reservation' : '/paiement/commande'}
            className="block w-full rounded-xl border-2 py-3.5 text-center text-sm font-bold uppercase tracking-wide"
            style={{
              borderColor: isReserve ? '#9146FF' : '#FE2C55',
              color: isReserve ? '#9146FF' : '#FE2C55',
            }}
          >
            {isReserve ? 'Aller à l’acompte' : 'Aller au paiement'}
          </Link>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-600">
        Prix et disponibilité synchronisés avec le catalogue Warignan. Après paiement, suis ta commande
        depuis l’onglet Suivi.
      </p>
    </main>
  );
};

export default ProductActionView;
