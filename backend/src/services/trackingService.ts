import { prisma } from '../lib/prisma.js';
import { orderPaymentSummary, sumConfirmedPayments, reservationDepositSummary } from './paymentTotals.js';

export type TrackingResponse =
  | { kind: 'order'; data: Record<string, unknown> }
  | { kind: 'reservation'; data: Record<string, unknown> }
  | { kind: 'payment'; data: Record<string, unknown> }
  | { kind: 'not_found' };

function normalizeRef(ref: string) {
  return ref.trim().toUpperCase();
}

export async function resolveTracking(reference: string): Promise<TrackingResponse> {
  const ref = normalizeRef(reference);
  if (!ref) return { kind: 'not_found' };

  const order = await prisma.order.findUnique({
    where: { reference: ref },
  });
  if (order) {
    const paid = await sumConfirmedPayments(order.reference, 'order');
    const pay = orderPaymentSummary(order.totalFcfa, paid);
    return {
      kind: 'order',
      data: {
        reference: order.reference,
        clientName: order.clientName,
        city: order.city,
        itemsSummary: order.itemsSummary,
        subtotalFcfa: order.subtotalFcfa,
        discountFcfa: order.discountFcfa,
        promoCode: order.promoCode,
        totalFcfa: order.totalFcfa,
        paidAt: order.paidAt?.toISOString() ?? null,
        paidFcfaConfirmed: pay.paidFcfaConfirmed,
        balanceDueFcfa: pay.balanceDueFcfa,
        paymentStatus: pay.paymentStatus,
        step: order.step,
      },
    };
  }

  const reservation = await prisma.reservation.findUnique({
    where: { reference: ref },
  });
  if (reservation) {
    const paidRes = await sumConfirmedPayments(reservation.reference, 'reservation');
    const dep = reservationDepositSummary(reservation.depositFcfa, paidRes);
    return {
      kind: 'reservation',
      data: {
        reference: reservation.reference,
        clientName: reservation.clientName,
        clientPhone: reservation.clientPhone,
        productsSummary: reservation.productsSummary,
        subtotalFcfa: reservation.subtotalFcfa,
        discountFcfa: reservation.discountFcfa,
        promoCode: reservation.promoCode,
        totalFcfa: reservation.totalFcfa,
        depositFcfa: reservation.depositFcfa,
        depositStatus: reservation.depositStatus,
        workflow: reservation.workflow,
        createdAt: reservation.createdAt.toISOString(),
        paidFcfaConfirmed: dep.paidFcfaConfirmed,
        depositShortfallFcfa: dep.depositShortfallFcfa,
        depositCoverage: dep.depositCoverage,
      },
    };
  }

  const payments = await prisma.paymentEvent.findMany({
    where: { reference: ref },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  if (payments.length > 0) {
    return {
      kind: 'payment',
      data: {
        reference: ref,
        events: payments.map((p) => ({
          flow: p.flow,
          amountFcfa: p.amountFcfa,
          provider: p.provider,
          status: p.status,
          createdAt: p.createdAt.toISOString(),
        })),
      },
    };
  }

  return { kind: 'not_found' };
}
