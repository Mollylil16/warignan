import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';

/** Analyse "CR-ABC ×2, RB-XYZ ×1" → [{ code, qty }] */
function parseItemsSummary(summary: string): Array<{ code: string; qty: number }> {
  return summary
    .split(',')
    .map((part) => part.trim())
    .flatMap((part) => {
      // format : CODE ×QTY (le × est U+00D7)
      const m = part.match(/^(\S+)\s+×(\d+)$/u);
      if (!m) return [];
      return [{ code: m[1], qty: parseInt(m[2], 10) }];
    });
}

/**
 * Après confirmation de paiement d'une commande, décrémente le stock de chaque
 * produit commandé et passe le statut à "sold" si le stock tombe à 0.
 */
export async function syncProductStockFromOrder(orderReference: string): Promise<void> {
  const ref = orderReference.trim().toUpperCase();
  const order = await prisma.order.findUnique({ where: { reference: ref } });
  if (!order) return;

  const lines = parseItemsSummary(order.itemsSummary);
  if (lines.length === 0) return;

  const codes = lines.map((l) => l.code);
  const products = await prisma.product.findMany({ where: { code: { in: codes } } });

  await prisma.$transaction(async (tx) => {
    for (const line of lines) {
      const product = products.find((p) => p.code === line.code);
      if (!product) continue;

      const newStock = Math.max(0, product.stock - line.qty);
      const newStatus = newStock <= 0 ? 'sold' : product.status;

      await tx.product.update({
        where: { id: product.id },
        data: { stock: newStock, status: newStatus },
      });

      logger.info(
        { code: product.code, oldStock: product.stock, newStock, status: newStatus },
        '[stock] mis à jour après paiement'
      );
    }
  });
}

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
  const wasAlreadyPaid = order.paidAt !== null;

  await prisma.order.update({
    where: { reference: ref },
    data: {
      paidAt: fullyPaid ? (order.paidAt ?? new Date()) : null,
    },
  });

  // Décrémente le stock uniquement lors du premier paiement intégral
  if (fullyPaid && !wasAlreadyPaid) {
    await syncProductStockFromOrder(ref);
  }
}

/**
 * Met à jour le statut d’acompte & le workflow d’une réservation depuis les événements de paiement.
 * - depositStatus: paid si acompte entièrement encaissé, sinon pending (sauf si déjà failed)
 * - workflow: passe à awaiting_validation automatiquement dès que l’acompte est couvert
 */
export async function syncReservationDepositFromEvents(reservationReference: string): Promise<void> {
  const ref = reservationReference.trim().toUpperCase();
  const r = await prisma.reservation.findUnique({ where: { reference: ref } });
  if (!r) return;

  const paid = await sumConfirmedPayments(ref, 'reservation');
  const fullyPaid = paid >= r.depositFcfa;

  const nextDepositStatus = fullyPaid ? 'paid' : r.depositStatus === 'failed' ? 'failed' : 'pending';
  const nextWorkflow =
    fullyPaid && r.workflow === 'awaiting_deposit' ? 'awaiting_validation' : r.workflow;

  await prisma.reservation.update({
    where: { reference: ref },
    data: {
      depositStatus: nextDepositStatus,
      workflow: nextWorkflow,
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
