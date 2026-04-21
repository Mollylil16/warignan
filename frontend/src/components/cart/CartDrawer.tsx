import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, X } from 'lucide-react';
import {
  cartLineToProduct,
  countItems,
  subtotalLines,
  useCartStore,
  type CartLine,
} from '../../stores/cartStore';
import { ACOMPTE_RESERVATION_RATIO, reservationDepositFcfa } from '../../constants/payments';
import { quotePromotion } from '../../services/checkoutApi';
import { apiErrorMessage } from '../../services/api';
import { formatPrice } from '../../utils/formatPrice';

const LineRow = ({
  line,
  onPlus,
  onMinus,
  onRemove,
  accent,
}: {
  line: CartLine;
  onPlus: () => void;
  onMinus: () => void;
  onRemove: () => void;
  accent: 'reserve' | 'order';
}) => {
  const lineTotal = line.prix * line.quantity;
  const border =
    accent === 'reserve' ? 'border-reserve-purple/40' : 'border-tiktok-pink/35';

  return (
    <li className={`flex gap-3 rounded-lg border ${border} bg-[#111] p-3`}>
      <div className="h-16 w-12 shrink-0 overflow-hidden rounded bg-[#1a1a1a]">
        {line.imageUrl ? (
          <img
            src={line.imageUrl}
            alt=""
            className="h-full w-full bg-black/20 object-contain object-center"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] text-neutral-600">
            —
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-medium text-neutral-500">{line.code}</p>
        <p className="line-clamp-2 text-sm font-semibold text-white">{line.nom}</p>
        <p className="mt-1 text-xs text-neutral-400">
          {formatPrice(line.prix)} × {line.quantity}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded border border-white/10 bg-black/40">
            <button
              type="button"
              onClick={onMinus}
              className="p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
              aria-label="Diminuer la quantité"
            >
              <Minus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
            <span className="min-w-[1.5rem] text-center text-sm font-bold text-white">
              {line.quantity}
            </span>
            <button
              type="button"
              onClick={onPlus}
              className="p-1.5 text-neutral-300 hover:bg-white/10 hover:text-white"
              aria-label="Augmenter la quantité"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          </div>
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 rounded px-2 py-1 text-[11px] text-neutral-500 hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
            Retirer
          </button>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold text-white">{formatPrice(lineTotal)}</p>
      </div>
    </li>
  );
};

const CartDrawer = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [promoBusy, setPromoBusy] = useState(false);
  const [promoErr, setPromoErr] = useState<string | null>(null);

  const open = useCartStore((s) => s.cartDrawerOpen);
  const tab = useCartStore((s) => s.cartDrawerTab);
  const setTab = useCartStore((s) => s.setCartDrawerTab);
  const closeCart = useCartStore((s) => s.closeCart);

  const reserveLines = useCartStore((s) => s.reserveLines);
  const orderLines = useCartStore((s) => s.orderLines);
  const addToReserve = useCartStore((s) => s.addToReserve);
  const addToOrder = useCartStore((s) => s.addToOrder);
  const decreaseReserve = useCartStore((s) => s.decreaseReserve);
  const decreaseOrder = useCartStore((s) => s.decreaseOrder);
  const removeFromReserve = useCartStore((s) => s.removeFromReserve);
  const removeFromOrder = useCartStore((s) => s.removeFromOrder);

  const reservePromoCode = useCartStore((s) => s.reservePromoCode);
  const orderPromoCode = useCartStore((s) => s.orderPromoCode);
  const reserveDiscountFcfa = useCartStore((s) => s.reserveDiscountFcfa);
  const orderDiscountFcfa = useCartStore((s) => s.orderDiscountFcfa);
  const reserveQuotedTotalFcfa = useCartStore((s) => s.reserveQuotedTotalFcfa);
  const orderQuotedTotalFcfa = useCartStore((s) => s.orderQuotedTotalFcfa);
  const setReservePromoCode = useCartStore((s) => s.setReservePromoCode);
  const setOrderPromoCode = useCartStore((s) => s.setOrderPromoCode);
  const setReservePromoQuote = useCartStore((s) => s.setReservePromoQuote);
  const setOrderPromoQuote = useCartStore((s) => s.setOrderPromoQuote);
  const clearReservePromo = useCartStore((s) => s.clearReservePromo);
  const clearOrderPromo = useCartStore((s) => s.clearOrderPromo);

  const reserveSub = subtotalLines(reserveLines);
  const orderSub = subtotalLines(orderLines);
  const reserveCount = countItems(reserveLines);
  const orderCount = countItems(orderLines);

  const reserveTotal = reserveQuotedTotalFcfa ?? reserveSub;
  const orderTotal = orderQuotedTotalFcfa ?? orderSub;
  const reserveDiscount = reserveQuotedTotalFcfa == null ? 0 : reserveDiscountFcfa;
  const orderDiscount = orderQuotedTotalFcfa == null ? 0 : orderDiscountFcfa;

  const acompteReserve = reservationDepositFcfa(reserveTotal);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lines = tab === 'reserve' ? reserveLines : orderLines;
  const sub = tab === 'reserve' ? reserveSub : orderSub;
  const discount = tab === 'reserve' ? reserveDiscount : orderDiscount;
  const total = tab === 'reserve' ? reserveTotal : orderTotal;
  const promoCode = tab === 'reserve' ? reservePromoCode : orderPromoCode;

  const applyPromo = async () => {
    setPromoErr(null);
    if (lines.length === 0) return;
    const code = promoCode.trim();
    if (!code) {
      tab === 'reserve' ? clearReservePromo() : clearOrderPromo();
      return;
    }
    setPromoBusy(true);
    try {
      const q = await quotePromotion({ code, subtotalFcfa: sub });
      if (!q.promoCode) {
        tab === 'reserve' ? clearReservePromo() : clearOrderPromo();
      } else if (tab === 'reserve') {
        setReservePromoQuote({
          promoCode: q.promoCode,
          discountFcfa: q.discountFcfa,
          totalFcfa: q.totalFcfa,
        });
      } else {
        setOrderPromoQuote({
          promoCode: q.promoCode,
          discountFcfa: q.discountFcfa,
          totalFcfa: q.totalFcfa,
        });
      }
    } catch (e) {
      setPromoErr(apiErrorMessage(e, 'Code promo invalide ou expiré.'));
      tab === 'reserve' ? clearReservePromo() : clearOrderPromo();
    } finally {
      setPromoBusy(false);
    }
  };

  const goPaiementReservation = () => {
    closeCart();
    navigate('/paiement/reservation');
  };

  const goPaiementCommande = () => {
    closeCart();
    navigate('/paiement/commande');
  };

  if (!mounted || !open) return null;

  const drawer = (
    <div
      className="pointer-events-none fixed inset-0 z-[200] isolate flex justify-end"
      role="presentation"
    >
      {/*
        Pas de backdrop-blur ici : sur certains navigateurs le calque plein écran + blur
        se retrouve au-dessus du tiroir et floute tout le panier (incluant les boutons).
        Fond assombri uniquement, z-index explicites pour garder le panier net au premier plan.
      */}
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-black/50"
        aria-hidden
      />

      <aside
        className="relative z-10 flex h-[100dvh] max-h-[100dvh] w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-[#0a0a0a] shadow-2xl pointer-events-auto"
        role="dialog"
        aria-modal="false"
        aria-labelledby="cart-title"
      >
        <header className="shrink-0 border-b border-white/10 px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <h2 id="cart-title" className="text-lg font-bold text-white">
              Panier
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="rounded-lg p-2 text-neutral-400 hover:bg-white/10 hover:text-white"
              aria-label="Fermer le panier"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
          </div>
          <p className="mt-2 text-left text-[11px] leading-snug text-neutral-500 sm:text-xs">
            Tu peux continuer à fouiller sur la page : ferme le panier avec le bouton en haut à
            droite, ajuste les quantités ici, puis rouvre le panier depuis l’icône quand tu veux.
          </p>
        </header>

        <div className="flex shrink-0 border-b border-white/10 px-2 pt-2">
          <button
            type="button"
            onClick={() => setTab('reserve')}
            className={`relative flex-1 px-3 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === 'reserve'
                ? 'text-reserve-purple'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Réserver
            {reserveCount > 0 && (
              <span className="ml-1.5 rounded-full bg-reserve-purple/20 px-2 py-0.5 text-xs text-reserve-purple">
                {reserveCount}
              </span>
            )}
            {tab === 'reserve' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-reserve-purple" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab('order')}
            className={`relative flex-1 px-3 py-3 text-sm font-bold uppercase tracking-wide transition-colors ${
              tab === 'order'
                ? 'text-tiktok-pink'
                : 'text-neutral-500 hover:text-neutral-300'
            }`}
          >
            Commander
            {orderCount > 0 && (
              <span className="ml-1.5 rounded-full bg-tiktok-pink/20 px-2 py-0.5 text-xs text-tiktok-pink">
                {orderCount}
              </span>
            )}
            {tab === 'order' && (
              <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-tiktok-pink" />
            )}
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          {lines.length === 0 ? (
            <div className="flex min-h-[40vh] flex-col items-center justify-center px-6 text-center text-neutral-500">
              <p className="text-sm">
                {tab === 'reserve'
                  ? 'Aucune réservation. Utilise « Réserver » sur les cartes, ou reviens fouiller pour ajouter des pièces.'
                  : 'Panier commande vide. Utilise « Commander » sur les cartes pour ajouter au paiement intégral.'}
              </p>
            </div>
          ) : (
            <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4">
              {lines.map((line) => (
                <LineRow
                  key={line.productId}
                  line={line}
                  accent={tab}
                  onPlus={() =>
                    tab === 'reserve'
                      ? addToReserve(cartLineToProduct(line))
                      : addToOrder(cartLineToProduct(line))
                  }
                  onMinus={() =>
                    tab === 'reserve'
                      ? decreaseReserve(line.productId)
                      : decreaseOrder(line.productId)
                  }
                  onRemove={() =>
                    tab === 'reserve'
                      ? removeFromReserve(line.productId)
                      : removeFromOrder(line.productId)
                  }
                />
              ))}
            </ul>
          )}

          <footer className="shrink-0 space-y-3 border-t border-white/10 bg-[#080808] p-4">
            <div className="flex justify-between text-sm text-neutral-400">
              <span>
                Sous-total {tab === 'reserve' ? 'réservations' : 'commandes'}
              </span>
              <span className="font-semibold text-white">{formatPrice(sub)}</span>
            </div>

            {lines.length > 0 && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <div className="flex items-center gap-2">
                  <input
                    value={promoCode}
                    onChange={(e) =>
                      tab === 'reserve'
                        ? setReservePromoCode(e.target.value)
                        : setOrderPromoCode(e.target.value)
                    }
                    className="h-10 flex-1 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
                    placeholder="Code promo (optionnel)"
                  />
                  <button
                    type="button"
                    disabled={promoBusy}
                    onClick={() => void applyPromo()}
                    className="h-10 rounded-lg border border-white/15 px-4 text-sm font-semibold text-neutral-300 hover:bg-white/5 hover:text-white disabled:opacity-50"
                  >
                    {promoBusy ? '…' : 'Appliquer'}
                  </button>
                  {(promoCode.trim() || discount > 0) && (
                    <button
                      type="button"
                      disabled={promoBusy}
                      onClick={() => {
                        setPromoErr(null);
                        tab === 'reserve' ? clearReservePromo() : clearOrderPromo();
                      }}
                      className="h-10 rounded-lg border border-white/10 px-3 text-xs font-semibold text-neutral-500 hover:bg-white/5 hover:text-neutral-300 disabled:opacity-50"
                    >
                      Retirer
                    </button>
                  )}
                </div>
                {promoErr && <p className="text-xs text-red-400">{promoErr}</p>}
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-neutral-400">
                    <span>Remise</span>
                    <span className="font-semibold text-white">- {formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-white">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            )}

            <p className="text-xs text-neutral-600">
              Total général (les deux onglets) :{' '}
              <span className="font-medium text-neutral-400">
                {formatPrice(reserveTotal + orderTotal)}
              </span>
            </p>

            {tab === 'reserve' && lines.length > 0 && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="text-xs leading-relaxed text-neutral-400">
                  Pour que la vendeuse valide ta réservation, un{' '}
                  <strong className="text-neutral-300">acompte</strong> est réglé
                  maintenant. Le reste se paie avec elle une fois l’article confirmé.
                </p>
                <p className="text-sm text-white">
                  Acompte à régler ({Math.round(ACOMPTE_RESERVATION_RATIO * 100)}% du sous-total
                  réservations)&nbsp;:{' '}
                  <span className="font-bold text-reserve-purple">
                    {formatPrice(acompteReserve)}
                  </span>
                </p>
                <button
                  type="button"
                  onClick={goPaiementReservation}
                  className="w-full rounded-lg border border-reserve-purple bg-reserve-purple/20 py-3 text-sm font-bold uppercase tracking-wide text-reserve-purple transition-colors hover:bg-reserve-purple/30"
                >
                  Verser l&apos;acompte et valider la réservation
                </button>
              </div>
            )}

            {tab === 'order' && lines.length > 0 && (
              <div className="space-y-2 border-t border-white/10 pt-3">
                <p className="text-xs leading-relaxed text-neutral-400">
                  Paiement du <strong className="text-neutral-300">montant intégral</strong> de ce
                  panier «&nbsp;Commander&nbsp;». Ensuite, livraison ou retrait selon ce qui est
                  prévu avec Warignan.
                </p>
                <button
                  type="button"
                  onClick={goPaiementCommande}
                  className="w-full rounded-lg bg-tiktok-pink py-3 text-sm font-bold uppercase tracking-wide text-white transition-colors hover:brightness-110"
                >
                  Payer et commander
                </button>
              </div>
            )}
          </footer>
        </div>
      </aside>
    </div>
  );

  return createPortal(drawer, document.body);
};

export default CartDrawer;
