import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { recordPaymentEvent } from '../services/paymentEventService.js';

const router = Router();

const bodySchema = z.object({
  reference: z.string().min(3),
  flow: z.enum(['order', 'reservation']),
  amountFcfa: z.number().int().nonnegative(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  provider: z.enum(['wave', 'orange', 'manual']).optional(),
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

export default router;
