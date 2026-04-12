import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export async function recordPaymentEvent(data: {
  reference: string;
  flow: string;
  amountFcfa: number;
  status: string;
  provider?: string | null;
  payload?: Prisma.InputJsonValue;
}) {
  return prisma.paymentEvent.create({
    data: {
      reference: data.reference.trim().toUpperCase(),
      flow: data.flow,
      amountFcfa: data.amountFcfa,
      provider: data.provider ?? null,
      status: data.status,
      payload: data.payload ?? undefined,
    },
  });
}
