import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { listMeta, paginationQuerySchema, resolvePagination } from '../lib/pagination.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { quotePromotion } from '../services/promotionQuote.js';

const router = Router();

const stepSchema = z.enum(['preparation', 'emballage', 'expediee', 'livree']);

const checkoutSchema = z.object({
  clientName: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  itemsSummary: z.string().min(1).max(2000),
  subtotalFcfa: z.number().int().positive(),
  promoCode: z.string().min(0).max(32).optional(),
});

function genUniqueOrderRef() {
  return `WRG-CMD-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/** Création commande côté client (panier) — sans auth. */
router.post('/checkout', async (req, res, next) => {
  try {
    const body = checkoutSchema.parse(req.body);
    const quoted = await quotePromotion({
      code: body.promoCode,
      subtotalFcfa: body.subtotalFcfa,
    });
    let reference = genUniqueOrderRef();
    for (let i = 0; i < 10; i++) {
      const clash = await prisma.order.findUnique({ where: { reference } });
      if (!clash) break;
      reference = genUniqueOrderRef();
    }
    const order = await prisma.order.create({
      data: {
        reference,
        clientName: body.clientName,
        city: body.city,
        itemsSummary: body.itemsSummary,
        subtotalFcfa: body.subtotalFcfa,
        discountFcfa: quoted.discountFcfa,
        promoCode: quoted.promoCode,
        totalFcfa: quoted.totalFcfa,
        paidAt: null,
        step: 'preparation',
      },
    });
    res.status(201).json({
      id: order.id,
      reference: order.reference,
      clientName: order.clientName,
      city: order.city,
      itemsSummary: order.itemsSummary,
      subtotalFcfa: order.subtotalFcfa,
      discountFcfa: order.discountFcfa,
      promoCode: order.promoCode,
      totalFcfa: order.totalFcfa,
      paidAt: null,
      step: order.step,
    });
  } catch (e) {
    next(e);
  }
});

router.use(requireAuth, requireRoles('vendeuse', 'admin'));

const listQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(120).optional(),
  step: stepSchema.optional(),
  city: z.string().trim().min(1).max(120).optional(),
  minTotalFcfa: z.coerce.number().int().nonnegative().optional(),
  maxTotalFcfa: z.coerce.number().int().nonnegative().optional(),
  fromISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

router.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const { page, limit, skip } = resolvePagination(q);

    const where: Record<string, unknown> = {};
    if (q.step) where.step = q.step;
    if (q.city) where.city = { contains: q.city, mode: 'insensitive' };
    if (q.q) {
      where.OR = [
        { reference: { contains: q.q, mode: 'insensitive' } },
        { clientName: { contains: q.q, mode: 'insensitive' } },
        { city: { contains: q.q, mode: 'insensitive' } },
        { itemsSummary: { contains: q.q, mode: 'insensitive' } },
      ];
    }
    if (q.minTotalFcfa != null || q.maxTotalFcfa != null) {
      where.totalFcfa = {
        ...(q.minTotalFcfa != null ? { gte: q.minTotalFcfa } : {}),
        ...(q.maxTotalFcfa != null ? { lte: q.maxTotalFcfa } : {}),
      };
    }
    if (q.fromISO || q.toISO) {
      const from = q.fromISO ? new Date(`${q.fromISO}T00:00:00.000Z`) : undefined;
      const to = q.toISO ? new Date(`${q.toISO}T23:59:59.999Z`) : undefined;
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);
    res.json({
      data: orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        clientName: o.clientName,
        city: o.city,
        itemsSummary: o.itemsSummary,
        subtotalFcfa: o.subtotalFcfa,
        discountFcfa: o.discountFcfa,
        promoCode: o.promoCode,
        totalFcfa: o.totalFcfa,
        paidAt: o.paidAt?.toISOString() ?? null,
        step: o.step,
        createdAt: o.createdAt.toISOString(),
      })),
      meta: listMeta(page, limit, total),
    });
  } catch (e) {
    next(e);
  }
});

router.post('/bulk-step', async (req, res, next) => {
  try {
    const body = z
      .object({
        ids: z.array(z.string().min(1)).min(1).max(200),
        step: stepSchema,
      })
      .parse(req.body);

    const result = await prisma.order.updateMany({
      where: { id: { in: body.ids } },
      data: { step: body.step },
    });
    res.json({ updated: result.count });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/step', async (req, res, next) => {
  try {
    const body = z.object({ step: stepSchema }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new HttpError(404, 'Commande introuvable');
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { step: body.step },
    });
    res.json({
      id: updated.id,
      reference: updated.reference,
      step: updated.step,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
