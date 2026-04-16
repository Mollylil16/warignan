import { api } from './api';

export async function quotePromotion(body: { code?: string; subtotalFcfa: number }) {
  const { data } = await api.post<{
    promoCode: string | null;
    discountFcfa: number;
    totalFcfa: number;
    promotion:
      | null
      | { id: string; code: string; label: string; type: 'percent' | 'fixed'; value: number };
  }>('/promotions/quote', body);
  return data;
}

export async function checkoutOrder(body: {
  clientName: string;
  city: string;
  itemsSummary: string;
  subtotalFcfa: number;
  promoCode?: string;
}) {
  const { data } = await api.post<{
    id: string;
    reference: string;
    subtotalFcfa: number;
    discountFcfa: number;
    promoCode: string | null;
    totalFcfa: number;
  }>('/orders/checkout', body);
  return data;
}

export async function checkoutReservation(body: {
  clientName: string;
  clientPhone: string;
  productsSummary: string;
  subtotalFcfa: number;
  promoCode?: string;
}) {
  const { data } = await api.post<{
    id: string;
    reference: string;
    subtotalFcfa: number;
    discountFcfa: number;
    promoCode: string | null;
    totalFcfa: number;
    depositFcfa: number;
  }>('/reservations/checkout', body);
  return data;
}
