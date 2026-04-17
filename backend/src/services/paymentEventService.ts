import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { syncOrderPaidAtFromEvents } from './paymentTotals.js';

export async function recordPaymentEvent(data: {
  reference: string;
  flow: string;
  amountFcfa: number;
  status: string;
  provider?: string | null;
  payload?: Prisma.InputJsonValue;
}) {
  const row = await prisma.paymentEvent.create({
    data: {
      reference: data.reference.trim().toUpperCase(),
      flow: data.flow,
      amountFcfa: data.amountFcfa,
      provider: data.provider ?? null,
      status: data.status,
      payload: data.payload ?? undefined,
    },
  });
  if (data.status === 'confirmed' && data.flow === 'order') {
    await syncOrderPaidAtFromEvents(data.reference);
  }
  return row;
}
