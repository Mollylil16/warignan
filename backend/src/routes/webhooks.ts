import type { Prisma } from '@prisma/client';
import express, { Router } from 'express';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
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

const geniusWebhookSchema = z.object({
  event: z.string().min(1),
  timestamp: z.number().int().optional(),
  data: z
    .object({
      reference: z.string().min(1).optional(),
      amount: z.number().optional(),
      currency: z.string().optional(),
      status: z.string().optional(),
      provider: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    })
    .optional(),
});

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

function mapGeniusPayStatus(txStatus: string | undefined): 'pending' | 'confirmed' | 'failed' {
  const s = (txStatus ?? '').toLowerCase();
  if (s === 'completed' || s === 'success' || s === 'succeeded') return 'confirmed';
  if (s === 'failed' || s === 'cancelled' || s === 'canceled') return 'failed';
  return 'pending';
}

function mapGeniusPayProvider(p: string | undefined): string {
  const x = (p ?? '').toLowerCase();
  if (x === 'wave') return 'wave';
  if (x === 'orange_money' || x === 'orange') return 'orange';
  return x || 'geniuspay';
}

router.post('/geniuspay', rawBodyParser, async (req, res, next) => {
  try {
    const raw = req.body as Buffer;
    if (!Buffer.isBuffer(raw) || raw.length === 0) {
      return res.status(400).json({ error: 'Corps JSON attendu' });
    }

    const timestampHeader = req.headers['x-webhook-timestamp'];
    const ts = Number(Array.isArray(timestampHeader) ? timestampHeader[0] : timestampHeader);
    if (!Number.isFinite(ts)) throw new HttpError(400, 'Header X-Webhook-Timestamp manquant');
    if (Math.abs(nowUnix() - ts) > 300) throw new HttpError(400, 'Timestamp webhook trop ancien');

    const secrets = [env.GENIUSPAY_WEBHOOK_SECRET, env.GENIUSPAY_WEBHOOK_SECRET_OLD]
      .map((s) => (s ?? '').trim())
      .filter(Boolean);
    if (secrets.length === 0) {
      if (env.NODE_ENV === 'production') {
        throw new HttpError(503, 'Configurer GENIUSPAY_WEBHOOK_SECRET en production pour accepter les webhooks GeniusPay');
      }
    } else {
      const signature = req.headers['x-webhook-signature'];
      const signedPayload = `${ts}.${raw.toString('utf8')}`;
      const ok = secrets.some((s) => verifyHmacSha256Hex(s, signedPayload, signature as string | string[] | undefined));
      if (!ok) throw new HttpError(401, 'Signature webhook invalide');
    }

    let json: unknown;
    try {
      json = JSON.parse(raw.toString('utf8')) as unknown;
    } catch {
      return res.status(400).json({ error: 'JSON invalide' });
    }

    // payload peut être { data: { ... } } ou { data: { object: "transaction", ... } }
    const parsed = geniusWebhookSchema.parse(json);
    const event = (req.headers['x-webhook-event'] as string | undefined) ?? parsed.event;
    if (!event) return res.status(200).json({ received: true });

    if (event !== 'payment.success' && event !== 'payment.failed') {
      return res.status(200).json({ received: true });
    }

    const d = (parsed as any).data ?? (parsed as any).data?.data ?? (parsed as any).data?.transaction;
    const meta = (d?.metadata ?? {}) as Record<string, unknown>;
    const warignanRef = String(meta.warignan_reference ?? meta.order_id ?? '').trim().toUpperCase();
    const flowRaw = String(meta.flow ?? '').trim().toLowerCase();
    const flow =
      flowRaw === 'reservation' || flowRaw === 'order'
        ? (flowRaw as 'order' | 'reservation')
        : /^WRG-RES/i.test(warignanRef)
          ? 'reservation'
          : 'order';

    const ref = warignanRef || String(d?.reference ?? '').trim().toUpperCase();
    const amountFcfa = Math.round(Number(d?.amount ?? 0));
    const status = event === 'payment.success' ? 'confirmed' : mapGeniusPayStatus(d?.status);
    const provider = mapGeniusPayProvider(d?.provider);
    const externalId = (parsed as any).id ? `geniuspay:webhook:${String((parsed as any).id)}` : null;
    const txRef = String(d?.reference ?? '').trim() || null;

    if (ref && amountFcfa >= 0) {
      await recordPaymentEvent({
        reference: ref,
        flow,
        amountFcfa,
        status,
        provider,
        externalId,
        payload: json as Prisma.InputJsonValue,
      });
      console.log(
        `[webhook][geniuspay] event=${event} ref=${ref} flow=${flow} amount=${amountFcfa} provider=${provider} status=${status}`
      );
    }

    if (ref && txRef) {
      await prisma.paymentIntent.updateMany({
        where: { reference: ref, provider: 'geniuspay', externalRef: txRef },
        data: {
          status: status === 'confirmed' ? 'confirmed' : status === 'failed' ? 'failed' : 'pending',
          externalId: externalId ?? undefined,
          payload: json as Prisma.InputJsonValue,
        },
      });
    }

    res.status(200).json({ received: true });
  } catch (e) {
    next(e);
  }
});

export default router;
