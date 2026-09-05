import crypto from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { listMeta, paginationQuerySchema, resolvePagination } from '../lib/pagination.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { quotePromotion } from '../services/promotionQuote.js';
import {
  orderPaymentSummary,
  orderStepRequiresFullPayment,
  sumConfirmedPayments,
  parseItemsSummary,
} from '../services/paymentTotals.js';
import {
  enrichSummariesWithProducts,
  buildEnrichedItems,
} from '../services/orderItems.js';

const router = Router();

const stepSchema = z.enum(['preparation', 'emballage', 'expediee', 'livree']);
const courierAssignSchema = z.object({
  courierId: z.string().min(1).nullable(),
  courierName: z.string().min(1).max(120).nullable().optional(),
});

const checkoutSchema = z.object({
  clientName: z.string().min(1).max(120),
  clientPhone: z.string().min(6).max(40).optional(),
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
    const lines = parseItemsSummary(body.itemsSummary);
    if (lines.length === 0) {
      throw new HttpError(400, 'Le récapitulatif de la commande est vide ou mal formaté.');
    }

    const codes = lines.map((l) => l.code);
    const products = await prisma.product.findMany({ where: { code: { in: codes } } });

    let computedSubtotal = 0;
    for (const line of lines) {
      const product = products.find((p) => p.code === line.code);
      if (!product) {
        throw new HttpError(404, `Produit avec le code ${line.code} introuvable dans le catalogue.`);
      }

      if (product.stock < line.qty || product.status === 'sold') {
        throw new HttpError(
          400,
          `Stock insuffisant pour l'article ${product.nom} (${product.code}). Restant: ${product.stock}.`
        );
      }

      computedSubtotal += product.prix * line.qty;
    }

    const quoted = await quotePromotion({
      code: body.promoCode,
      subtotalFcfa: computedSubtotal,
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
        clientPhone: body.clientPhone ?? null,
        city: body.city,
        itemsSummary: body.itemsSummary,
        subtotalFcfa: computedSubtotal,
        discountFcfa: quoted.discountFcfa,
        promoCode: quoted.promoCode,
        totalFcfa: quoted.totalFcfa,
        paidAt: null,
        step: 'preparation',
      },
    });
    const productMap = new Map(products.map((p) => [p.code, p]));
    const items = buildEnrichedItems(order.itemsSummary, productMap);

    res.status(201).json({
      id: order.id,
      reference: order.reference,
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      city: order.city,
      itemsSummary: order.itemsSummary,
      items,
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
    if (q.city) where.city = { contains: q.city };
    if (q.q) {
      where.OR = [
        { reference: { contains: q.q } },
        { clientName: { contains: q.q } },
        { clientPhone: { contains: q.q } },
        { city: { contains: q.q } },
        { itemsSummary: { contains: q.q } },
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

    const refs = orders.map((o) => o.reference);
    const paidByRef = new Map<string, number>();
    if (refs.length > 0) {
      const sums = await prisma.paymentEvent.groupBy({
        by: ['reference'],
        where: { reference: { in: refs }, status: 'confirmed', flow: 'order' },
        _sum: { amountFcfa: true },
      });
      for (const s of sums) {
        paidByRef.set(s.reference, s._sum.amountFcfa ?? 0);
      }
    }

    const itemsBySummary = await enrichSummariesWithProducts(orders.map((o) => o.itemsSummary));

    res.json({
      data: orders.map((o) => {
        const paid = paidByRef.get(o.reference) ?? 0;
        const pay = orderPaymentSummary(o.totalFcfa, paid);
        return {
          id: o.id,
          reference: o.reference,
          clientName: o.clientName,
          clientPhone: o.clientPhone ?? null,
          city: o.city,
          itemsSummary: o.itemsSummary,
          items: itemsBySummary.get(o.itemsSummary) ?? [],
          subtotalFcfa: o.subtotalFcfa,
          discountFcfa: o.discountFcfa,
          promoCode: o.promoCode,
          totalFcfa: o.totalFcfa,
          paidAt: o.paidAt?.toISOString() ?? null,
          paidFcfaConfirmed: pay.paidFcfaConfirmed,
          balanceDueFcfa: pay.balanceDueFcfa,
          paymentStatus: pay.paymentStatus,
          courierId: (o as any).courierId ?? null,
          courierName: (o as any).courierName ?? null,
          step: o.step,
          createdAt: o.createdAt.toISOString(),
        };
      }),
      meta: listMeta(page, limit, total),
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id/courier', async (req, res, next) => {
  try {
    const body = courierAssignSchema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new HttpError(404, 'Commande introuvable');

    const data: { courierId: string | null; courierName?: string | null } = {
      courierId: body.courierId,
    };
    if (body.courierName !== undefined) data.courierName = body.courierName;
    const updated = await prisma.order.update({ where: { id: order.id }, data });

    res.json({
      id: updated.id,
      reference: updated.reference,
      courierId: (updated as any).courierId ?? null,
      courierName: (updated as any).courierName ?? null,
    });
  } catch (e) {
    next(e);
  }
});

/** Mise à jour manuelle du numéro de téléphone client (par la vendeuse depuis le détail). */
router.patch('/:id/phone', async (req, res, next) => {
  try {
    const body = z.object({ clientPhone: z.string().max(40).nullable() }).parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) throw new HttpError(404, 'Commande introuvable');
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { clientPhone: body.clientPhone ?? null },
    });
    res.json({ id: updated.id, reference: updated.reference, clientPhone: updated.clientPhone ?? null });
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

    const rows = await prisma.order.findMany({ where: { id: { in: body.ids } } });
    if (rows.length !== body.ids.length) {
      throw new HttpError(400, 'Certaines commandes sont introuvables.');
    }
    if (orderStepRequiresFullPayment(body.step)) {
      for (const o of rows) {
        const paid = await sumConfirmedPayments(o.reference, 'order');
        if (paid < o.totalFcfa) {
          throw new HttpError(
            400,
            `Commande ${o.reference} : encaissement incomplet (${paid} / ${o.totalFcfa} FCFA confirmés). ` +
              `Impossible de passer en ${body.step} sans paiement intégral.`
          );
        }
      }
    }

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
    if (orderStepRequiresFullPayment(body.step)) {
      const paid = await sumConfirmedPayments(order.reference, 'order');
      if (paid < order.totalFcfa) {
        throw new HttpError(
          400,
          `Encaissement incomplet (${paid} / ${order.totalFcfa} FCFA confirmés). ` +
            `Emballage et expédition sont réservés au paiement intégral.`
        );
      }
    }
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
