import type { Prisma } from '@prisma/client';
import express, { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { verifyHmacSha256Hex } from '../lib/webhookSignature.js';
import { HttpError } from '../middleware/errorHandler.js';
import { recordPaymentEvent } from '../services/paymentEventService.js';

const router = Router();

const rawBodyParser = express.raw({ type: '*/*', limit: '2mb' });

const paymentBodySchema = z.object({
  reference: z.string().min(3),
  flow: z.enum(['order', 'reservation']),
  amountFcfa: z.number().int().nonnegative(),
  status: z.enum(['pending', 'confirmed', 'failed']),
  provider: z.enum(['wave', 'orange', 'manual']).optional(),
});

function assertWebhookSignature(
  secret: string | undefined,
  raw: Buffer,
  headerName: string,
  req: express.Request,
  prodMessage: string
): void {
  const secretTrim = secret?.trim() ?? '';
  if (!secretTrim) {
    if (env.NODE_ENV === 'production') {
      throw new HttpError(503, prodMessage);
    }
    return;
  }
  const sig = req.headers[headerName.toLowerCase()] ?? req.headers[headerName];
  const ok = verifyHmacSha256Hex(secretTrim, raw, sig as string | undefined);
  if (!ok) {
    throw new HttpError(401, 'Signature webhook invalide');
  }
}

router.post('/wave', rawBodyParser, async (req, res, next) => {
  try {
    const raw = req.body as Buffer;
    if (!Buffer.isBuffer(raw) || raw.length === 0) {
      return res.status(400).json({ error: 'Corps JSON attendu' });
    }
    assertWebhookSignature(
      env.WAVE_WEBHOOK_SECRET,
      raw,
      'x-wave-signature',
      req,
      'Configurer WAVE_WEBHOOK_SECRET en production pour accepter les webhooks Wave'
    );
    let json: unknown;
    try {
      json = JSON.parse(raw.toString('utf8')) as unknown;
    } catch {
      return res.status(400).json({ error: 'JSON invalide' });
    }
    const body = paymentBodySchema.parse(json);
    await recordPaymentEvent({
      ...body,
      reference: body.reference,
      provider: body.provider ?? 'wave',
      payload: json as Prisma.InputJsonValue,
    });
    res.status(200).json({ received: true });
  } catch (e) {
    next(e);
  }
});

router.post('/orange-money', rawBodyParser, async (req, res, next) => {
  try {
    const raw = req.body as Buffer;
    if (!Buffer.isBuffer(raw) || raw.length === 0) {
      return res.status(400).json({ error: 'Corps JSON attendu' });
    }
    assertWebhookSignature(
      env.ORANGE_MONEY_WEBHOOK_SECRET,
      raw,
      'x-orange-money-signature',
      req,
      'Configurer ORANGE_MONEY_WEBHOOK_SECRET en production pour accepter les webhooks Orange Money'
    );
    let json: unknown;
    try {
      json = JSON.parse(raw.toString('utf8')) as unknown;
    } catch {
      return res.status(400).json({ error: 'JSON invalide' });
    }
    const body = paymentBodySchema.parse(json);
    await recordPaymentEvent({
      ...body,
      reference: body.reference,
      provider: body.provider ?? 'orange',
      payload: json as Prisma.InputJsonValue,
    });
    res.status(200).json({ received: true });
  } catch (e) {
    next(e);
  }
});

export default router;
