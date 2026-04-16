import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ProductCategory, ProductStatus, type Product } from '../types';

export type CartDrawerTab = 'reserve' | 'order';

/** Ligne affichée dans le panier (snapshot du produit au moment de l’ajout). */
export interface CartLine {
  productId: string;
  code: string;
  nom: string;
  prix: number;
  imageUrl: string;
  quantity: number;
}

function snapshotFromProduct(product: Product): Omit<CartLine, 'quantity'> {
  return {
    productId: product.id,
    code: product.code,
    nom: product.nom,
    prix: product.prix,
    imageUrl: product.imageName[0] ?? '',
  };
}

function addOrIncrement(lines: CartLine[], product: Product): CartLine[] {
  const snap = snapshotFromProduct(product);
  const i = lines.findIndex((l) => l.productId === product.id);
  if (i === -1) return [...lines, { ...snap, quantity: 1 }];
  const next = [...lines];
  next[i] = { ...next[i], quantity: next[i].quantity + 1 };
  return next;
}

function decrementOrRemove(lines: CartLine[], productId: string): CartLine[] {
  const i = lines.findIndex((l) => l.productId === productId);
  if (i === -1) return lines;
  const line = lines[i];
  if (line.quantity <= 1) return lines.filter((l) => l.productId !== productId);
  const next = [...lines];
  next[i] = { ...line, quantity: line.quantity - 1 };
  return next;
}

function removeLine(lines: CartLine[], productId: string): CartLine[] {
  return lines.filter((l) => l.productId !== productId);
}

export const subtotalLines = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.prix * l.quantity, 0);

export const countItems = (lines: CartLine[]) =>
  lines.reduce((sum, l) => sum + l.quantity, 0);

/** Reconstruit un Product minimal pour ré‑incrémenter une ligne depuis le tiroir. */
export function cartLineToProduct(line: CartLine): Product {
  return {
    id: line.productId,
    code: line.code,
    nom: line.nom,
    description: '',
    prix: line.prix,
    category: ProductCategory.ROBE,
    status: ProductStatus.DISPONIBLE,
    createdAt: '',
    imageName: line.imageUrl ? [line.imageUrl] : [],
    stock: 99,
  };
}

interface CartState {
  reserveLines: CartLine[];
  orderLines: CartLine[];
  cartDrawerOpen: boolean;
  cartDrawerTab: CartDrawerTab;

  reservePromoCode: string;
  orderPromoCode: string;
  reserveDiscountFcfa: number;
  orderDiscountFcfa: number;
  reserveQuotedTotalFcfa: number | null;
  orderQuotedTotalFcfa: number | null;

  addToReserve: (product: Product) => void;
  addToOrder: (product: Product) => void;
  decreaseReserve: (productId: string) => void;
  decreaseOrder: (productId: string) => void;
  removeFromReserve: (productId: string) => void;
  removeFromOrder: (productId: string) => void;

  setReservePromoCode: (code: string) => void;
  setOrderPromoCode: (code: string) => void;

  setReservePromoQuote: (quote: {
    promoCode: string;
    discountFcfa: number;
    totalFcfa: number;
  }) => void;
  setOrderPromoQuote: (quote: {
    promoCode: string;
    discountFcfa: number;
    totalFcfa: number;
  }) => void;
  clearReservePromo: () => void;
  clearOrderPromo: () => void;

  openCart: (tab: CartDrawerTab) => void;
  closeCart: () => void;
  toggleCart: () => void;
  setCartDrawerTab: (tab: CartDrawerTab) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      reserveLines: [],
      orderLines: [],
      cartDrawerOpen: false,
      cartDrawerTab: 'reserve',

      reservePromoCode: '',
      orderPromoCode: '',
      reserveDiscountFcfa: 0,
      orderDiscountFcfa: 0,
      reserveQuotedTotalFcfa: null,
      orderQuotedTotalFcfa: null,

      setReservePromoCode: (code) =>
        set({
          reservePromoCode: code,
          reserveDiscountFcfa: 0,
          reserveQuotedTotalFcfa: null,
        }),

      setOrderPromoCode: (code) =>
        set({
          orderPromoCode: code,
          orderDiscountFcfa: 0,
          orderQuotedTotalFcfa: null,
        }),

      addToReserve: (product) =>
        set((s) => ({
          reserveLines: addOrIncrement(s.reserveLines, product),
          cartDrawerOpen: true,
          cartDrawerTab: 'reserve',
        })),

      addToOrder: (product) =>
        set((s) => ({
          orderLines: addOrIncrement(s.orderLines, product),
          cartDrawerOpen: true,
          cartDrawerTab: 'order',
        })),

      decreaseReserve: (productId) =>
        set((s) => ({
          reserveLines: decrementOrRemove(s.reserveLines, productId),
        })),

      decreaseOrder: (productId) =>
        set((s) => ({
          orderLines: decrementOrRemove(s.orderLines, productId),
        })),

      removeFromReserve: (productId) =>
        set((s) => ({
          reserveLines: removeLine(s.reserveLines, productId),
        })),

      removeFromOrder: (productId) =>
        set((s) => ({
          orderLines: removeLine(s.orderLines, productId),
        })),

      setReservePromoQuote: (quote) =>
        set({
          reservePromoCode: quote.promoCode.trim().toUpperCase(),
          reserveDiscountFcfa: Math.max(0, Math.trunc(quote.discountFcfa)),
          reserveQuotedTotalFcfa: Math.max(0, Math.trunc(quote.totalFcfa)),
        }),

      setOrderPromoQuote: (quote) =>
        set({
          orderPromoCode: quote.promoCode.trim().toUpperCase(),
          orderDiscountFcfa: Math.max(0, Math.trunc(quote.discountFcfa)),
          orderQuotedTotalFcfa: Math.max(0, Math.trunc(quote.totalFcfa)),
        }),

      clearReservePromo: () =>
        set({ reservePromoCode: '', reserveDiscountFcfa: 0, reserveQuotedTotalFcfa: null }),

      clearOrderPromo: () =>
        set({ orderPromoCode: '', orderDiscountFcfa: 0, orderQuotedTotalFcfa: null }),

      openCart: (tab) => set({ cartDrawerOpen: true, cartDrawerTab: tab }),

      closeCart: () => set({ cartDrawerOpen: false }),

      toggleCart: () =>
        set((s) => {
          if (s.cartDrawerOpen) return { cartDrawerOpen: false };
          return { cartDrawerOpen: true, cartDrawerTab: 'reserve' };
        }),

      setCartDrawerTab: (tab) => set({ cartDrawerTab: tab }),
    }),
    {
      name: 'warignan-cart',
      partialize: (s) => ({
        reserveLines: s.reserveLines,
        orderLines: s.orderLines,
        reservePromoCode: s.reservePromoCode,
        orderPromoCode: s.orderPromoCode,
        reserveDiscountFcfa: s.reserveDiscountFcfa,
        orderDiscountFcfa: s.orderDiscountFcfa,
        reserveQuotedTotalFcfa: s.reserveQuotedTotalFcfa,
        orderQuotedTotalFcfa: s.orderQuotedTotalFcfa,
      }),
    }
  )
);
