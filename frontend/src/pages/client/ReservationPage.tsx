import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import ProductActionView from '../../components/shared/ProductActionView';
import { mockProducts } from '../../data/mockProducts';
import { useCartStore } from '../../stores/cartStore';

const ReservationPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const addToReserve = useCartStore((s) => s.addToReserve);
  const reserveLines = useCartStore((s) => s.reserveLines);

  const product = useMemo(
    () => mockProducts.find((p) => p.id === productId),
    [productId]
  );

  const inCart = product ? reserveLines.some((l) => l.productId === product.id) : false;

  if (!productId || !product) {
    return (
      <main className="mx-auto max-w-lg px-4 py-16 text-center text-white">
        <h1 className="mb-4 text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Produit introuvable
        </h1>
        <p className="mb-6 text-sm text-neutral-400">
          Ce lien n’est pas valide ou l’article n’existe plus dans la démo.
        </p>
        <Link
          to="/fouille"
          className="inline-block rounded-lg bg-reserve-purple px-6 py-3 text-sm font-bold text-white"
        >
          Voir la fouille
        </Link>
      </main>
    );
  }

  return (
    <ProductActionView
      product={product}
      intent="reserve"
      inCart={inCart}
      onAddToCart={() => addToReserve(product)}
    />
  );
};

export default ReservationPage;
