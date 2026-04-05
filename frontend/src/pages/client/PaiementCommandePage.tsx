import { Link } from 'react-router-dom';
import PaymentProviderButtons from '../../components/payment/PaymentProviderButtons';
import { subtotalLines, useCartStore } from '../../stores/cartStore';
import { formatPrice } from '../../utils/formatPrice';

const PaiementCommandePage = () => {
  const orderLines = useCartStore((s) => s.orderLines);
  const orderSub = subtotalLines(orderLines);

  if (orderLines.length === 0) {
    return (
      <main className="mx-auto max-w-lg px-4 py-10 text-center text-white">
        <h1
          className="mb-4 text-xl font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Paiement — Commande
        </h1>
        <p className="mb-6 text-sm text-neutral-400">
          Ton panier «&nbsp;Commander&nbsp;» est vide. Ajoute des articles depuis la fouille.
        </p>
        <Link
          to="/fouille"
          className="inline-block rounded-lg bg-tiktok-pink px-6 py-3 text-sm font-bold text-white"
        >
          Retour à la fouille
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8 text-white sm:py-10">
      <h1
        className="mb-2 text-center text-xl font-bold"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Paiement — Commande
      </h1>
      <p className="mb-6 text-center text-sm leading-relaxed text-neutral-400">
        Règle le montant total avec Wave ou Orange Money. La livraison ou le retrait sera organisé
        avec Warignan après confirmation du paiement.
      </p>

      <div className="mb-6 rounded-xl border border-white/10 bg-[#111] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Récapitulatif commande
        </p>
        <ul className="mb-3 max-h-40 space-y-2 overflow-y-auto text-sm text-neutral-300">
          {orderLines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2">
              <span className="min-w-0 truncate">
                {l.code} ×{l.quantity}
              </span>
              <span className="shrink-0">{formatPrice(l.prix * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-white/10 pt-2 text-base font-bold text-tiktok-pink">
          <span>Total à payer</span>
          <span>{formatPrice(orderSub)}</span>
        </div>
      </div>

      <PaymentProviderButtons amountFcfa={orderSub} flow="order" />

      <div className="mt-8 text-center">
        <Link
          to="/fouille"
          className="text-sm font-semibold text-tiktok-cyan underline-offset-2 hover:underline"
        >
          Retour à la fouille
        </Link>
      </div>
    </main>
  );
};

export default PaiementCommandePage;
