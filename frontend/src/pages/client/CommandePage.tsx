import { Link, useParams } from 'react-router-dom';
import ProductActionView from '../../components/shared/ProductActionView';
import { useProduct } from '../../hooks/useProduct';
import { useCartStore } from '../../stores/cartStore';

const CommandePage = () => {
  const { productId } = useParams<{ productId: string }>();
  const addToOrder = useCartStore((s) => s.addToOrder);
  const orderLines = useCartStore((s) => s.orderLines);

  const { data: product, isLoading, error } = useProduct(productId);

  const inCart = product ? orderLines.some((l) => l.productId === product.id) : false;

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
          Ce lien n’est pas valide ou l’article n’existe pas dans le catalogue en ligne.
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

  return (
    <ProductActionView
      product={product}
      intent="order"
      inCart={inCart}
      onAddToCart={() => addToOrder(product)}
    />
  );
};

export default CommandePage;
