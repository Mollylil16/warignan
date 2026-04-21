import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import PaymentProviderButtons from '../../components/payment/PaymentProviderButtons';
import { checkoutOrder, quotePromotion } from '../../services/checkoutApi';
import { apiErrorMessage } from '../../services/api';
import { subtotalLines, useCartStore } from '../../stores/cartStore';
import { cartLinesToSummary } from '../../utils/cartSummary';
import { formatPrice } from '../../utils/formatPrice';

const PaiementCommandePage = () => {
  const orderLines = useCartStore((s) => s.orderLines);
  const orderPromoCodeStore = useCartStore((s) => s.orderPromoCode);
  const orderDiscountStore = useCartStore((s) => s.orderDiscountFcfa);
  const orderQuotedTotalStore = useCartStore((s) => s.orderQuotedTotalFcfa);
  const orderSub = subtotalLines(orderLines);

  const [clientName, setClientName] = useState('');
  const [city, setCity] = useState('');
  const [promoCode, setPromoCode] = useState(orderPromoCodeStore);
  const [discountFcfa, setDiscountFcfa] = useState(orderDiscountStore);
  const [totalFcfa, setTotalFcfa] = useState(orderQuotedTotalStore ?? orderSub);
  const [serverRef, setServerRef] = useState<string | null>(null);
  const [checkoutErr, setCheckoutErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const applyPromo = async () => {
    setCheckoutErr(null);
    try {
      const q = await quotePromotion({ code: promoCode, subtotalFcfa: orderSub });
      setDiscountFcfa(q.discountFcfa);
      setTotalFcfa(q.totalFcfa);
    } catch (e) {
      setDiscountFcfa(0);
      setTotalFcfa(orderSub);
      setCheckoutErr(apiErrorMessage(e, 'Code promo invalide ou expiré.'));
    }
  };

  const handleConfirm = async (e: FormEvent) => {
    e.preventDefault();
    setCheckoutErr(null);
    setBusy(true);
    try {
      const res = await checkoutOrder({
        clientName: clientName.trim(),
        city: city.trim(),
        itemsSummary: cartLinesToSummary(orderLines),
        subtotalFcfa: orderSub,
        promoCode: promoCode.trim() ? promoCode.trim() : undefined,
      });
      setServerRef(res.reference);
    } catch (e) {
      setCheckoutErr(apiErrorMessage(e, 'Impossible de créer la commande. Vérifie que l’API est démarrée.'));
    } finally {
      setBusy(false);
    }
  };

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
        Étape 1 : enregistre ta commande sur le serveur. Étape 2 : paie avec Wave ou Orange Money en
        utilisant la référence affichée (suivi sur la page « Suivi »).
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
        <div className="border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            <input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
              placeholder="Code promo (optionnel)"
            />
            <button
              type="button"
              onClick={() => void applyPromo()}
              className="h-10 rounded-lg border border-white/15 px-4 text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white"
            >
              Appliquer
            </button>
          </div>
          {discountFcfa > 0 && (
            <div className="mt-2 flex justify-between text-sm text-neutral-400">
              <span>Remise</span>
              <span className="font-semibold text-white">- {formatPrice(discountFcfa)}</span>
            </div>
          )}
          <div className="mt-2 flex justify-between text-base font-bold text-tiktok-pink">
            <span>Total à payer</span>
            <span>{formatPrice(totalFcfa)}</span>
          </div>
        </div>
      </div>

      {!serverRef ? (
        <form onSubmit={handleConfirm} className="mb-6 space-y-4 rounded-xl border border-white/10 bg-[#111] p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Nom affiché</label>
            <input
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              placeholder="Prénom N."
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-neutral-400">Ville / commune</label>
            <input
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white"
              placeholder="Abidjan — Cocody"
            />
          </div>
          {checkoutErr && <p className="text-xs text-red-400">{checkoutErr}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-tiktok-pink py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
          >
            {busy ? 'Enregistrement…' : 'Enregistrer la commande et continuer'}
          </button>
        </form>
      ) : (
        <PaymentProviderButtons
          amountFcfa={totalFcfa}
          flow="order"
          reference={serverRef}
          allowPartial
        />
      )}

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
