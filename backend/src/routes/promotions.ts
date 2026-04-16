import type { Prisma, PromotionType } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { listMeta, paginationQuerySchema, resolvePagination } from '../lib/pagination.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { quotePromotion } from '../services/promotionQuote.js';

const router = Router();

const todayISO = () => new Date().toISOString().slice(0, 10);

function promotionToDto(p: {
  id: string;
  code: string;
  label: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: Date;
}) {
  return {
    id: p.id,
    code: p.code,
    label: p.label,
    type: p.type,
    value: p.value,
    startDate: p.startDate,
    endDate: p.endDate,
    active: p.active,
    createdAt: p.createdAt.toISOString(),
  };
}

/** Codes promo actuellement valides (dates + actif) — public. */
router.get('/active', async (_req, res, next) => {
  try {
    const d = todayISO();
    const rows = await prisma.promotion.findMany({
      where: {
        active: true,
        startDate: { lte: d },
        endDate: { gte: d },
      },
      orderBy: { code: 'asc' },
    });
    res.json({ data: rows.map(promotionToDto) });
  } catch (e) {
    next(e);
  }
});

/** Simulation/validation promo pour un montant — public. */
router.post('/quote', async (req, res, next) => {
  try {
    const body = z
      .object({
        code: z.string().min(0).max(32).optional(),
        subtotalFcfa: z.number().int().nonnegative(),
      })
      .parse(req.body);

    const q = await quotePromotion({ code: body.code, subtotalFcfa: body.subtotalFcfa });
    res.json(q);
  } catch (e) {
    next(e);
  }
});

router.get(
  '/stats',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const q = z
        .object({
          fromISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          toISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
        })
        .parse(req.query);

      const from = q.fromISO ? new Date(`${q.fromISO}T00:00:00.000Z`) : undefined;
      const to = q.toISO ? new Date(`${q.toISO}T23:59:59.999Z`) : undefined;
      const dateWhere = from || to ? { createdAt: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {};

      const [promos, orderAgg, resAgg, avgOrder] = await Promise.all([
        prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } }),
        prisma.order.groupBy({
          by: ['promoCode'],
          where: { promoCode: { not: null }, ...dateWhere },
          _count: { _all: true },
          _sum: { discountFcfa: true, subtotalFcfa: true, totalFcfa: true },
        }),
        prisma.reservation.groupBy({
          by: ['promoCode'],
          where: { promoCode: { not: null }, ...dateWhere },
          _count: { _all: true },
          _sum: { discountFcfa: true, subtotalFcfa: true, totalFcfa: true },
        }),
        prisma.order.aggregate({
          _avg: { subtotalFcfa: true },
          where: { ...dateWhere },
        }),
      ]);

      const orderByCode = new Map(
        orderAgg
          .filter((r) => typeof r.promoCode === 'string' && r.promoCode)
          .map((r) => [
            String(r.promoCode),
            {
              uses: r._count._all,
              discountFcfa: r._sum.discountFcfa ?? 0,
              subtotalFcfa: r._sum.subtotalFcfa ?? 0,
              totalFcfa: r._sum.totalFcfa ?? 0,
            },
          ])
      );
      const resByCode = new Map(
        resAgg
          .filter((r) => typeof r.promoCode === 'string' && r.promoCode)
          .map((r) => [
            String(r.promoCode),
            {
              uses: r._count._all,
              discountFcfa: r._sum.discountFcfa ?? 0,
              subtotalFcfa: r._sum.subtotalFcfa ?? 0,
              totalFcfa: r._sum.totalFcfa ?? 0,
            },
          ])
      );

      const avgSubtotalFcfa = Math.round(avgOrder._avg.subtotalFcfa ?? 0);

      res.json({
        meta: {
          fromISO: q.fromISO ?? null,
          toISO: q.toISO ?? null,
          avgOrderSubtotalFcfa: avgSubtotalFcfa,
        },
        data: promos.map((p) => {
          const o = orderByCode.get(p.code) ?? { uses: 0, discountFcfa: 0, subtotalFcfa: 0, totalFcfa: 0 };
          const r = resByCode.get(p.code) ?? { uses: 0, discountFcfa: 0, subtotalFcfa: 0, totalFcfa: 0 };
          const uses = o.uses + r.uses;
          const discountFcfa = o.discountFcfa + r.discountFcfa;

          const warnings: string[] = [];
          if (p.type === 'percent' && p.value >= 60) warnings.push('Remise % élevée (≥ 60%).');
          if (p.type === 'fixed' && avgSubtotalFcfa > 0 && p.value > avgSubtotalFcfa) {
            warnings.push('Remise fixe > panier moyen (risque de marge).');
          }

          return {
            id: p.id,
            code: p.code,
            label: p.label,
            type: p.type,
            value: p.value,
            active: p.active,
            startDate: p.startDate,
            endDate: p.endDate,
            uses,
            discountFcfa,
            usesOrders: o.uses,
            usesReservations: r.uses,
            warnings,
          };
        }),
      });
    } catch (e) {
      next(e);
    }
  }
);

const createSchema = z.object({
  code: z.string().min(2).max(32),
  label: z.string().min(1).max(200),
  type: z.enum(['percent', 'fixed']),
  value: z.number().int().positive(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  active: z.boolean().optional(),
});

const patchSchema = createSchema.partial().extend({
  code: z.string().min(2).max(32).optional(),
});

router.get('/', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const q = paginationQuerySchema.parse(req.query);
    const { page, limit, skip } = resolvePagination(q);
    const [rows, total] = await Promise.all([
      prisma.promotion.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.promotion.count(),
    ]);
    res.json({ data: rows.map(promotionToDto), meta: listMeta(page, limit, total) });
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    if (body.type === 'percent' && body.value > 100) {
      throw new HttpError(400, 'Un pourcentage ne peut pas dépasser 100');
    }
    if (body.endDate < body.startDate) {
      throw new HttpError(400, 'La date de fin doit être après la date de début');
    }
    const exists = await prisma.promotion.findUnique({
      where: { code: body.code.trim().toUpperCase() },
    });
    if (exists) throw new HttpError(409, 'Ce code promo existe déjà');
    const p = await prisma.promotion.create({
      data: {
        code: body.code.trim().toUpperCase(),
        label: body.label.trim(),
        type: body.type,
        value: body.value,
        startDate: body.startDate,
        endDate: body.endDate,
        active: body.active ?? true,
      },
    });
    res.status(201).json(promotionToDto(p));
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const body = patchSchema.parse(req.body);
    const cur = await prisma.promotion.findUnique({ where: { id: req.params.id } });
    if (!cur) throw new HttpError(404, 'Promotion introuvable');
    if (body.type === 'percent' && body.value != null && body.value > 100) {
      throw new HttpError(400, 'Un pourcentage ne peut pas dépasser 100');
    }
    const start = body.startDate ?? cur.startDate;
    const end = body.endDate ?? cur.endDate;
    if (end < start) throw new HttpError(400, 'Dates invalides');
    const data = Object.fromEntries(
      Object.entries(body).filter(([, v]) => v !== undefined)
    ) as Record<string, unknown>;
    if (typeof data.code === 'string') {
      data.code = data.code.trim().toUpperCase();
    }
    const updated = await prisma.promotion.update({
      where: { id: req.params.id },
      data: data as Prisma.PromotionUpdateInput,
    });
    res.json(promotionToDto(updated));
  } catch (e) {
    next(e);
  }
});

router.delete('/:id', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const exists = await prisma.promotion.findUnique({ where: { id: req.params.id } });
    if (!exists) throw new HttpError(404, 'Promotion introuvable');
    await prisma.promotion.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
