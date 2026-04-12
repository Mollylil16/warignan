import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const stepSchema = z.enum(['preparation', 'emballage', 'expediee', 'livree']);

router.use(requireAuth, requireRoles('vendeuse', 'admin'));

router.get('/', async (_req, res, next) => {
  try {
    const orders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({
      data: orders.map((o) => ({
        id: o.id,
        reference: o.reference,
        clientName: o.clientName,
        city: o.city,
        itemsSummary: o.itemsSummary,
        totalFcfa: o.totalFcfa,
        paidAt: o.paidAt?.toISOString() ?? null,
        step: o.step,
        createdAt: o.createdAt.toISOString(),
      })),
    });
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
