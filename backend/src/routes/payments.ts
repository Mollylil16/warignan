import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { recordPaymentEvent } from '../services/paymentEventService.js';
import { geniusPayCreatePayment } from '../services/geniusPay.js';
import { HttpError } from '../middleware/errorHandler.js';
import { sumConfirmedPayments } from '../services/paymentTotals.js';
import { reconcileGeniusPay } from '../services/geniusPayReconcile.js';

const router = Router();

const bodySchema = z.object({
  reference: z.string().min(3),
  flow: z.enum(['order', 'reservation']),
  amountFcfa: z.number().int().nonnegative(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  provider: z.enum(['wave', 'orange', 'manual', 'geniuspay']).optional(),
});

const geniusPayCheckoutSchema = z.object({
  reference: z.string().min(3),
  flow: z.enum(['order', 'reservation']),
  /** Montant demandé. Pour commande: peut être partiel. Pour réservation: acompte (ou partiel) */
  amountFcfa: z.number().int().positive(),
  customer: z
    .object({
      name: z.string().min(1).max(120).optional(),
      email: z.string().email().optional(),
      phone: z.string().min(3).max(32).optional(),
      country: z.string().min(2).max(2).optional(),
    })
    .optional(),
  successUrl: z.string().url().optional(),
  errorUrl: z.string().url().optional(),
});

/**
 * Initie un paiement GeniusPay (checkout hébergé). Accessible côté client.
 * Le webhook `payment.success` confirmera ensuite automatiquement le paiement.
 */
router.post('/geniuspay/checkout', async (req, res, next) => {
  try {
    const body = geniusPayCheckoutSchema.parse(req.body);
    const ref = body.reference.trim().toUpperCase();

    if (body.flow === 'order') {
      const order = await prisma.order.findUnique({ where: { reference: ref } });
      if (!order) throw new HttpError(404, 'Commande introuvable');
      const paid = await sumConfirmedPayments(ref, 'order');
      const remaining = Math.max(0, order.totalFcfa - paid);
      if (remaining <= 0) throw new HttpError(400, 'Commande déjà entièrement encaissée');
      const amount = Math.min(body.amountFcfa, remaining);
      const g = await geniusPayCreatePayment({
        amount,
        description: `Commande ${ref}`,
        customer: body.customer,
        metadata: { warignan_reference: ref, flow: 'order' },
        success_url: body.successUrl,
        error_url: body.errorUrl,
      });
      await prisma.paymentIntent.create({
        data: {
          reference: ref,
          flow: 'order',
          amountFcfa: amount,
          provider: 'geniuspay',
          status: 'pending',
          checkoutUrl: g.checkout_url ?? g.payment_url ?? null,
          gateway: g.gateway ?? null,
          externalRef: g.reference ?? null,
          payload: JSON.parse(JSON.stringify(g)) as Prisma.InputJsonValue,
        },
      });
      await recordPaymentEvent({
        reference: ref,
        flow: 'order',
        amountFcfa: amount,
        status: 'pending',
        provider: 'geniuspay',
        payload: JSON.parse(JSON.stringify({ kind: 'geniuspay.checkout', ...g })) as Prisma.InputJsonValue,
      });
      return res.status(201).json({ checkoutUrl: g.checkout_url ?? g.payment_url, provider: g.gateway ?? 'geniuspay' });
    }

    const r = await prisma.reservation.findUnique({ where: { reference: ref } });
    if (!r) throw new HttpError(404, 'Réservation introuvable');
    const paid = await sumConfirmedPayments(ref, 'reservation');
    const remaining = Math.max(0, r.depositFcfa - paid);
    if (remaining <= 0) throw new HttpError(400, 'Acompte déjà entièrement encaissé');
    const amount = Math.min(body.amountFcfa, remaining);
    const g = await geniusPayCreatePayment({
      amount,
      description: `Acompte ${ref}`,
      customer: body.customer,
      metadata: { warignan_reference: ref, flow: 'reservation' },
      success_url: body.successUrl,
      error_url: body.errorUrl,
    });
    await prisma.paymentIntent.create({
      data: {
        reference: ref,
        flow: 'reservation',
        amountFcfa: amount,
        provider: 'geniuspay',
        status: 'pending',
        checkoutUrl: g.checkout_url ?? g.payment_url ?? null,
        gateway: g.gateway ?? null,
        externalRef: g.reference ?? null,
        payload: JSON.parse(JSON.stringify(g)) as Prisma.InputJsonValue,
      },
    });
    await recordPaymentEvent({
      reference: ref,
      flow: 'reservation',
      amountFcfa: amount,
      status: 'pending',
      provider: 'geniuspay',
      payload: JSON.parse(JSON.stringify({ kind: 'geniuspay.checkout', ...g })) as Prisma.InputJsonValue,
    });
    return res.status(201).json({ checkoutUrl: g.checkout_url ?? g.payment_url, provider: g.gateway ?? 'geniuspay' });
  } catch (e) {
    next(e);
  }
});

const summaryQuerySchema = z.object({
  reference: z.string().min(3),
  flow: z.enum(['order', 'reservation']),
});

/**
 * Résumé paiement côté client : déjà encaissé (confirmé) + reste à payer.
 * Sert au “paiement smart” (payer le reste / montant personnalisé).
 */
router.get('/summary', async (req, res, next) => {
  try {
    const q = summaryQuerySchema.parse(req.query);
    const ref = q.reference.trim().toUpperCase();
    if (q.flow === 'order') {
      const order = await prisma.order.findUnique({
        where: { reference: ref },
        select: { reference: true, totalFcfa: true, clientName: true, city: true },
      });
      if (!order) throw new HttpError(404, 'Commande introuvable');
      const paid = await sumConfirmedPayments(ref, 'order');
      const remaining = Math.max(0, order.totalFcfa - paid);
      return res.json({
        reference: order.reference,
        flow: 'order',
        expectedFcfa: order.totalFcfa,
        paidConfirmedFcfa: paid,
        remainingFcfa: remaining,
        target: { kind: 'order' as const, clientName: order.clientName, city: order.city },
      });
    }
    const r = await prisma.reservation.findUnique({
      where: { reference: ref },
      select: { reference: true, depositFcfa: true, clientName: true, clientPhone: true },
    });
    if (!r) throw new HttpError(404, 'Réservation introuvable');
    const paid = await sumConfirmedPayments(ref, 'reservation');
    const remaining = Math.max(0, r.depositFcfa - paid);
    return res.json({
      reference: r.reference,
      flow: 'reservation',
      expectedFcfa: r.depositFcfa,
      paidConfirmedFcfa: paid,
      remainingFcfa: remaining,
      target: { kind: 'reservation' as const, clientName: r.clientName, clientPhone: r.clientPhone },
    });
  } catch (e) {
    next(e);
  }
});

const reconcileBodySchema = z.object({
  /** Nombre de jours en arrière (UTC) à réconcilier. */
  days: z.coerce.number().int().min(1).max(30).default(3),
});

/**
 * Réconciliation GeniusPay (manuel, sécurisé).
 * Rapporte les paiements GeniusPay récents et crée des PaymentEvent confirmés/failed si manquants.
 */
router.post('/geniuspay/reconcile', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const body = reconcileBodySchema.parse(req.body ?? {});
    const result = await reconcileGeniusPay(body.days);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

/**
 * Saisie manuelle côté vendeuse (hors webhook) — utile en démo et en secours.
 */
router.post('/', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const body = bodySchema.parse(req.body);
    const row = await recordPaymentEvent({
      reference: body.reference,
      flow: body.flow,
      amountFcfa: body.amountFcfa,
      status: body.status,
      provider: body.provider ?? 'manual',
      payload: JSON.parse(JSON.stringify(req.body)) as Prisma.InputJsonValue,
    });
    res.status(201).json(row);
  } catch (e) {
    next(e);
  }
});

const listQuerySchema = z.object({
  q: z.string().trim().min(1).max(120).optional(),
  flow: z.enum(['order', 'reservation']).optional(),
  provider: z.enum(['wave', 'orange', 'manual', 'geniuspay']).optional(),
  status: z.enum(['pending', 'confirmed', 'failed']).optional(),
  fromISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

/** Cumul des montants confirmés par (référence, flow), ordre chronologique, indexé par id d’événement. */
function buildConfirmedCumulativeByEventId(
  rows: { id: string; reference: string; flow: string; status: string; amountFcfa: number; createdAt: Date }[]
): Map<string, number> {
  const sorted = [...rows].sort((a, b) => {
    const ka = `${a.reference}\0${a.flow}`;
    const kb = `${b.reference}\0${b.flow}`;
    if (ka !== kb) return ka < kb ? -1 : ka > kb ? 1 : 0;
    const t = a.createdAt.getTime() - b.createdAt.getTime();
    if (t !== 0) return t < 0 ? -1 : 1;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  const out = new Map<string, number>();
  let key = '';
  let run = 0;
  for (const row of sorted) {
    const nk = `${row.reference}\0${row.flow}`;
    if (nk !== key) {
      key = nk;
      run = 0;
    }
    if (row.status === 'confirmed') {
      run += row.amountFcfa;
    }
    out.set(row.id, run);
  }
  return out;
}

router.get('/', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const limit = q.limit ?? 50;
    const page = q.page ?? 1;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (q.flow) where.flow = q.flow;
    if (q.provider) where.provider = q.provider;
    if (q.status) where.status = q.status;
    if (q.q) {
      where.OR = [
        { reference: { contains: q.q } },
        { status: { contains: q.q } },
        { provider: { contains: q.q } },
      ];
    }
    if (q.fromISO || q.toISO) {
      const from = q.fromISO ? new Date(`${q.fromISO}T00:00:00.000Z`) : undefined;
      const to = q.toISO ? new Date(`${q.toISO}T23:59:59.999Z`) : undefined;
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [total, events] = await Promise.all([
      prisma.paymentEvent.count({ where }),
      prisma.paymentEvent.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip,
        take: limit,
      }),
    ]);

    const refs = Array.from(new Set(events.map((e: { reference: string }) => e.reference)));
    const relatedForCumul =
      refs.length === 0
        ? []
        : await prisma.paymentEvent.findMany({
            where: { reference: { in: refs } },
            select: { id: true, reference: true, flow: true, status: true, amountFcfa: true, createdAt: true },
          });
    const cumById = buildConfirmedCumulativeByEventId(relatedForCumul);

    const [orders, reservations] = await Promise.all([
      prisma.order.findMany({
        where: { reference: { in: refs } },
        select: { reference: true, id: true, totalFcfa: true, clientName: true, city: true },
      }),
      prisma.reservation.findMany({
        where: { reference: { in: refs } },
        select: {
          reference: true,
          id: true,
          totalFcfa: true,
          depositFcfa: true,
          clientName: true,
          clientPhone: true,
        },
      }),
    ]);
    const orderByRef = new Map<
      string,
      { reference: string; id: string; totalFcfa: number; clientName: string; city: string }
    >(orders.map((o) => [o.reference, o]));
    const resByRef = new Map(
      reservations.map((r) => [
        r.reference,
        {
          reference: r.reference,
          id: r.id,
          totalFcfa: r.totalFcfa,
          depositFcfa: r.depositFcfa,
          clientName: r.clientName,
          clientPhone: r.clientPhone,
        },
      ])
    );

    res.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data: events.map((e) => {
        const order = orderByRef.get(e.reference) ?? null;
        const reservation = resByRef.get(e.reference) ?? null;
        const match = Boolean(order || reservation);
        const confirmedCumulativeFcfa = cumById.get(e.id) ?? 0;
        const expectedFcfa =
          order && e.flow === 'order'
            ? order.totalFcfa
            : reservation && e.flow === 'reservation'
              ? reservation.depositFcfa
              : null;
        const balanceAfterFcfa =
          expectedFcfa != null ? Math.max(0, expectedFcfa - confirmedCumulativeFcfa) : null;
        return {
          id: e.id,
          reference: e.reference,
          flow: e.flow,
          provider: e.provider,
          status: e.status,
          amountFcfa: e.amountFcfa,
          createdAt: e.createdAt.toISOString(),
          match,
          confirmedCumulativeFcfa,
          expectedFcfa,
          balanceAfterFcfa,
          target:
            order
              ? {
                  kind: 'order' as const,
                  id: order.id,
                  reference: order.reference,
                  clientName: order.clientName,
                  city: order.city,
                  totalFcfa: order.totalFcfa,
                }
              : reservation
                ? {
                    kind: 'reservation' as const,
                    id: reservation.id,
                    reference: reservation.reference,
                    clientName: reservation.clientName,
                    clientPhone: reservation.clientPhone,
                    totalFcfa: reservation.totalFcfa,
                    depositFcfa: reservation.depositFcfa,
                  }
                : null,
        };
      }),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
