import { prisma } from '../lib/prisma.js';

/** Somme des paiements confirmés pour une référence (commande ou réservation). */
export async function sumConfirmedPayments(
  reference: string,
  flow: 'order' | 'reservation'
): Promise<number> {
  const ref = reference.trim().toUpperCase();
  const agg = await prisma.paymentEvent.aggregate({
    where: { reference: ref, flow, status: 'confirmed' },
    _sum: { amountFcfa: true },
  });
  return agg._sum.amountFcfa ?? 0;
}

/** Met à jour `paidAt` sur la commande : rempli seulement quand le total est entièrement encaissé. */
export async function syncOrderPaidAtFromEvents(orderReference: string): Promise<void> {
  const ref = orderReference.trim().toUpperCase();
  const order = await prisma.order.findUnique({ where: { reference: ref } });
  if (!order) return;

  const paid = await sumConfirmedPayments(ref, 'order');
  const fullyPaid = paid >= order.totalFcfa;

  await prisma.order.update({
    where: { reference: ref },
    data: {
      paidAt: fullyPaid ? (order.paidAt ?? new Date()) : null,
    },
  });
}

export type OrderPaymentSummary = {
  paidFcfaConfirmed: number;
  balanceDueFcfa: number;
  paymentStatus: 'unpaid' | 'partial' | 'full';
};

export function orderPaymentSummary(totalFcfa: number, paidFcfa: number): OrderPaymentSummary {
  const paidFcfaConfirmed = Math.max(0, paidFcfa);
  const balanceDueFcfa = Math.max(0, totalFcfa - paidFcfaConfirmed);
  const paymentStatus: OrderPaymentSummary['paymentStatus'] =
    paidFcfaConfirmed >= totalFcfa ? 'full' : paidFcfaConfirmed > 0 ? 'partial' : 'unpaid';
  return { paidFcfaConfirmed, balanceDueFcfa, paymentStatus };
}

export type ReservationDepositSummary = {
  paidFcfaConfirmed: number;
  depositShortfallFcfa: number;
  depositCoverage: 'none' | 'partial' | 'full';
};

export function reservationDepositSummary(
  depositFcfa: number,
  paidFcfa: number
): ReservationDepositSummary {
  const paidFcfaConfirmed = Math.max(0, paidFcfa);
  const depositShortfallFcfa = Math.max(0, depositFcfa - paidFcfaConfirmed);
  const depositCoverage: ReservationDepositSummary['depositCoverage'] =
    paidFcfaConfirmed >= depositFcfa ? 'full' : paidFcfaConfirmed > 0 ? 'partial' : 'none';
  return { paidFcfaConfirmed, depositShortfallFcfa, depositCoverage };
}

const SHIPMENT_STEPS = new Set(['emballage', 'expediee', 'livree']);

export function orderStepRequiresFullPayment(step: string): boolean {
  return SHIPMENT_STEPS.has(step);
}
