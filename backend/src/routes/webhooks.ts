import type { Prisma } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { recordPaymentEvent } from '../services/paymentEventService.js';

const router = Router();

const paymentBodySchema = z.object({
  reference: z.string().min(3),
  flow: z.enum(['order', 'reservation']),
  amountFcfa: z.number().int().nonnegative(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  provider: z.enum(['wave', 'orange', 'manual']).optional(),
});

/**
 * Stocke un événement paiement — sans vérification de signature (exercice collègue).
 */
router.post('/wave', async (req, res, next) => {
  try {
    // EXERCICE_JUNIOR : vérifier X-Wave-Signature avec env.WAVE_WEBHOOK_SECRET
    if (env.WAVE_WEBHOOK_SECRET && env.NODE_ENV === 'production') {
      /* collègue : implémenter la vérif ici */
    }
    const body = paymentBodySchema.parse(req.body);
    await recordPaymentEvent({
      ...body,
      reference: body.reference,
      provider: body.provider ?? 'wave',
      payload: JSON.parse(JSON.stringify(req.body)) as Prisma.InputJsonValue,
    });
    res.status(200).json({ received: true });
  } catch (e) {
    next(e);
  }
});

router.post('/orange-money', async (req, res, next) => {
  try {
    // EXERCICE_JUNIOR : vérifier signature Orange Money
    if (env.ORANGE_MONEY_WEBHOOK_SECRET && env.NODE_ENV === 'production') {
      /* collègue */
    }
    const body = paymentBodySchema.parse(req.body);
    await recordPaymentEvent({
      ...body,
      reference: body.reference,
      provider: body.provider ?? 'orange',
      payload: JSON.parse(JSON.stringify(req.body)) as Prisma.InputJsonValue,
    });
    res.status(200).json({ received: true });
  } catch (e) {
    next(e);
  }
});

export default router;
