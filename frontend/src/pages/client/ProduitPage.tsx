import { Link, useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useProduct';
import { useCartStore } from '../../stores/cartStore';
import { Product, ProductStatus } from '../../types';
import { formatPriceParts } from '../../utils/formatPrice';
import StockBadge from '../../components/ui/stockBadge';
import ProductImageCarousel from '../../components/shared/ProductImageCarousel';

const ProduitDetail = ({ product }: { product: Product }) => {
  const addToOrder = useCartStore((s) => s.addToOrder);
  const addToReserve = useCartStore((s) => s.addToReserve);
  const orderLines = useCartStore((s) => s.orderLines);
  const reserveLines = useCartStore((s) => s.reserveLines);

  const inOrder = orderLines.some((l) => l.productId === product.id);
  const inReserve = reserveLines.some((l) => l.productId === product.id);

  const { amount, currency } = formatPriceParts(product.prix);
  const isUnavailable =
    product.status === ProductStatus.RESERVER || product.status === ProductStatus.SOLD;

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
          onClick={() => addToOrder(product)}
          className="w-full rounded-xl bg-tiktok-pink py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUnavailable ? 'Indisponible' : 'Ajouter au panier commande'}
        </button>

        {inOrder && !isUnavailable && (
          <Link
            to="/paiement/commande"
            className="block w-full rounded-xl border-2 border-tiktok-pink py-3.5 text-center text-sm font-bold uppercase tracking-wide text-tiktok-pink"
          >
            Aller au paiement
          </Link>
        )}

        <button
          type="button"
          disabled={isUnavailable}
          onClick={() => addToReserve(product)}
          className="w-full rounded-xl bg-reserve-purple py-4 text-sm font-bold uppercase tracking-wide text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isUnavailable ? 'Indisponible' : 'Ajouter au panier réservation'}
        </button>

        {inReserve && !isUnavailable && (
          <Link
            to="/paiement/reservation"
            className="block w-full rounded-xl border-2 border-reserve-purple py-3.5 text-center text-sm font-bold uppercase tracking-wide text-reserve-purple"
          >
            Aller à l'acompte
          </Link>
        )}
      </div>

      <p className="mt-6 text-center text-xs text-neutral-600">
        Prix et disponibilité synchronisés avec le catalogue Warignan. Après paiement, suis ta commande
        depuis l'onglet Suivi.
      </p>
    </main>
  );
};

const ProduitPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const { data: product, isLoading, error } = useProduct(productId);

  if (!productId) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Lien invalide
        </h1>
        <Link to="/fouille" className="text-tiktok-cyan underline">
          Fouille
        </Link>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-neutral-400">
        Chargement du produit…
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Produit introuvable
        </h1>
        <p className="mb-6 text-sm text-neutral-400">
          Ce lien n'est pas valide ou l'article n'existe pas dans le catalogue.
        </p>
        <Link
          to="/fouille"
          className="inline-block rounded-lg bg-tiktok-pink px-6 py-3 text-sm font-bold text-white"
        >
          Voir la fouille
        </Link>
      </main>
    );
  }

  return <ProduitDetail product={product} />;
};

export default ProduitPage;
