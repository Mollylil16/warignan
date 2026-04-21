import type { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { geniusPayListPayments } from './geniusPay.js';
import { recordPaymentEvent } from './paymentEventService.js';

export async function reconcileGeniusPay(days: number) {
  const now = new Date();
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - Math.max(1, Math.min(30, days)));
  const fromISO = from.toISOString().slice(0, 10);
  const toISO = now.toISOString().slice(0, 10);

  const rows = await geniusPayListPayments({ from: fromISO, to: toISO, per_page: 100 });

  let createdOrExisting = 0;
  let updatedIntents = 0;
  let skipped = 0;

  for (const p of rows) {
    const meta = (p.metadata ?? {}) as Record<string, unknown>;
    const ref = String(meta.warignan_reference ?? '').trim().toUpperCase();
    if (!ref) {
      skipped += 1;
      continue;
    }
    const flowRaw = String(meta.flow ?? '').trim().toLowerCase();
    const flow =
      flowRaw === 'order' || flowRaw === 'reservation'
        ? flowRaw
        : /^WRG-RES/i.test(ref)
          ? 'reservation'
          : 'order';

    const statusLower = (p.status ?? '').toLowerCase();
    const status =
      statusLower === 'completed'
        ? 'confirmed'
        : statusLower === 'failed' || statusLower === 'cancelled' || statusLower === 'expired'
          ? 'failed'
          : 'pending';

    if (status === 'pending') continue;

    const provider =
      (p.provider ?? '').toLowerCase() === 'wave'
        ? 'wave'
        : (p.provider ?? '').toLowerCase().includes('orange')
          ? 'orange'
          : 'geniuspay';

    const externalId = `geniuspay:payment:${p.reference}`;

    await recordPaymentEvent({
      reference: ref,
      flow,
      amountFcfa: Math.round(Number(p.amount ?? 0)),
      status,
      provider,
      externalId,
      payload: JSON.parse(JSON.stringify({ kind: 'geniuspay.reconcile', payment: p })) as Prisma.InputJsonValue,
    });
    createdOrExisting += 1;

    const r = await prisma.paymentIntent.updateMany({
      where: { reference: ref, provider: 'geniuspay', externalRef: p.reference },
      data: {
        status: status === 'confirmed' ? 'confirmed' : 'failed',
        externalId,
        payload: JSON.parse(JSON.stringify(p)) as Prisma.InputJsonValue,
      },
    });
    updatedIntents += r.count;
  }

  return { from: fromISO, to: toISO, scanned: rows.length, createdOrExisting, updatedIntents, skipped };
}

