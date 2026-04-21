import crypto from 'node:crypto';
import type { DepositStatus, ReservationWorkflow } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { listMeta, paginationQuerySchema, resolvePagination } from '../lib/pagination.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';
import { quotePromotion } from '../services/promotionQuote.js';
import { reservationDepositSummary, sumConfirmedPayments } from '../services/paymentTotals.js';

const router = Router();

const ACOMPTE_RESERVATION_RATIO = 0.3;

const checkoutSchema = z.object({
  clientName: z.string().min(1).max(120),
  clientPhone: z.string().min(6).max(40),
  productsSummary: z.string().min(1).max(2000),
  subtotalFcfa: z.number().int().positive(),
  promoCode: z.string().min(0).max(32).optional(),
});

function genUniqueResRef() {
  return `WRG-RES-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
}

/** Création réservation côté client (panier) — sans auth. */
router.post('/checkout', async (req, res, next) => {
  try {
    const body = checkoutSchema.parse(req.body);
    const quoted = await quotePromotion({
      code: body.promoCode,
      subtotalFcfa: body.subtotalFcfa,
    });
    const depositFcfa = Math.ceil(quoted.totalFcfa * ACOMPTE_RESERVATION_RATIO);
    let reference = genUniqueResRef();
    for (let i = 0; i < 10; i++) {
      const clash = await prisma.reservation.findUnique({ where: { reference } });
      if (!clash) break;
      reference = genUniqueResRef();
    }
    const r = await prisma.reservation.create({
      data: {
        reference,
        clientName: body.clientName,
        clientPhone: body.clientPhone,
        productsSummary: body.productsSummary,
        subtotalFcfa: body.subtotalFcfa,
        discountFcfa: quoted.discountFcfa,
        promoCode: quoted.promoCode,
        totalFcfa: quoted.totalFcfa,
        depositFcfa,
        depositStatus: 'pending',
        workflow: 'awaiting_deposit',
      },
    });
    res.status(201).json({
      id: r.id,
      reference: r.reference,
      clientName: r.clientName,
      clientPhone: r.clientPhone,
      productsSummary: r.productsSummary,
      subtotalFcfa: r.subtotalFcfa,
      discountFcfa: r.discountFcfa,
      promoCode: r.promoCode,
      totalFcfa: r.totalFcfa,
      depositFcfa: r.depositFcfa,
      depositStatus: r.depositStatus,
      workflow: r.workflow,
    });
  } catch (e) {
    next(e);
  }
});

router.use(requireAuth, requireRoles('vendeuse', 'admin'));

const listQuerySchema = paginationQuerySchema.extend({
  q: z.string().trim().min(1).max(120).optional(),
  workflow: z
    .enum(['awaiting_deposit', 'awaiting_validation', 'validated', 'cancelled'])
    .optional(),
  depositStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  fromISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const patchBodySchema = z
  .object({
    workflow: z
      .enum(['awaiting_deposit', 'awaiting_validation', 'validated', 'cancelled'])
      .optional(),
    depositStatus: z.enum(['pending', 'paid', 'failed']).optional(),
  })
  .refine((b) => b.workflow !== undefined || b.depositStatus !== undefined, {
    message: 'Au moins un champ requis',
  });

function reservationToDto(
  r: {
    id: string;
    reference: string;
    clientName: string;
    clientPhone: string;
    productsSummary: string;
    subtotalFcfa: number;
    discountFcfa: number;
    promoCode: string | null;
    totalFcfa: number;
    depositFcfa: number;
    depositStatus: DepositStatus;
    workflow: ReservationWorkflow;
    createdAt: Date;
  },
  depositPay: ReturnType<typeof reservationDepositSummary>
) {
  return {
    id: r.id,
    reference: r.reference,
    clientName: r.clientName,
    clientPhone: r.clientPhone,
    productsSummary: r.productsSummary,
    subtotalFcfa: r.subtotalFcfa,
    discountFcfa: r.discountFcfa,
    promoCode: r.promoCode,
    totalFcfa: r.totalFcfa,
    depositFcfa: r.depositFcfa,
    depositStatus: r.depositStatus,
    workflow: r.workflow,
    createdAt: r.createdAt.toISOString(),
    paidFcfaConfirmed: depositPay.paidFcfaConfirmed,
    depositShortfallFcfa: depositPay.depositShortfallFcfa,
    depositCoverage: depositPay.depositCoverage,
  };
}

function assertDepositTransition(from: DepositStatus, to: DepositStatus) {
  const allowed: Record<DepositStatus, DepositStatus[]> = {
    pending: ['paid', 'failed'],
    failed: ['pending', 'paid'],
    paid: ['paid'],
  };
  if (!allowed[from].includes(to)) {
    throw new HttpError(400, `Transition d’acompte interdite : ${from} → ${to}`);
  }
}

function assertWorkflowTransition(
  from: ReservationWorkflow,
  to: ReservationWorkflow,
  depositAfter: DepositStatus
) {
  if (from === to) return;
  if (from === 'validated' || from === 'cancelled') {
    throw new HttpError(400, 'Cette réservation ne peut plus changer de workflow');
  }
  if (to === 'cancelled') return;
  if (from === 'awaiting_deposit') {
    if (to === 'awaiting_validation' && depositAfter !== 'paid') {
      throw new HttpError(400, 'L’acompte doit être « paid » pour passer en validation');
    }
    if (to === 'validated') {
      throw new HttpError(400, 'Valider d’abord la réservation (étape validation)');
    }
    if (to !== 'awaiting_validation') {
      throw new HttpError(400, 'Transition de workflow invalide depuis awaiting_deposit');
    }
  }
  if (from === 'awaiting_validation') {
    if (to !== 'validated') {
      throw new HttpError(400, 'Transition de workflow invalide depuis awaiting_validation');
    }
    if (to === 'validated' && depositAfter !== 'paid') {
      throw new HttpError(400, 'L’acompte doit être payé pour valider la réservation');
    }
  }
}

router.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const { page, limit, skip } = resolvePagination(q);
    const where: Record<string, unknown> = {};
    if (q.workflow) where.workflow = q.workflow;
    if (q.depositStatus) where.depositStatus = q.depositStatus;
    if (q.q) {
      where.OR = [
        { reference: { contains: q.q } },
        { clientName: { contains: q.q } },
        { clientPhone: { contains: q.q } },
        { productsSummary: { contains: q.q } },
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
    const [rows, total] = await Promise.all([
      prisma.reservation.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.reservation.count({ where }),
    ]);

    const resRefs = rows.map((r) => r.reference);
    const paidResByRef = new Map<string, number>();
    if (resRefs.length > 0) {
      const sums = await prisma.paymentEvent.groupBy({
        by: ['reference'],
        where: { reference: { in: resRefs }, status: 'confirmed', flow: 'reservation' },
        _sum: { amountFcfa: true },
      });
      for (const s of sums) {
        paidResByRef.set(s.reference, s._sum.amountFcfa ?? 0);
      }
    }

    res.json({
      data: rows.map((r) => {
        const paid = paidResByRef.get(r.reference) ?? 0;
        return reservationToDto(r, reservationDepositSummary(r.depositFcfa, paid));
      }),
      meta: listMeta(page, limit, total),
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const body = patchBodySchema.parse(req.body);
    const current = await prisma.reservation.findUnique({ where: { id: req.params.id } });
    if (!current) throw new HttpError(404, 'Réservation introuvable');

    let nextDeposit = current.depositStatus;
    let nextWorkflow = current.workflow;

    if (body.depositStatus !== undefined) {
      assertDepositTransition(current.depositStatus, body.depositStatus);
      nextDeposit = body.depositStatus;
    }

    if (body.workflow !== undefined) {
      assertWorkflowTransition(current.workflow, body.workflow, nextDeposit);
      nextWorkflow = body.workflow;
    }

    if (
      current.workflow === 'awaiting_deposit' &&
      nextDeposit === 'paid' &&
      body.workflow === undefined
    ) {
      nextWorkflow = 'awaiting_validation';
    }

    if (body.workflow === 'awaiting_validation' && nextDeposit !== 'paid') {
      throw new HttpError(400, 'L’acompte doit être « paid » pour ce workflow');
    }

    if (body.workflow === 'validated' && nextDeposit !== 'paid') {
      throw new HttpError(400, 'L’acompte doit être « paid » pour valider');
    }

    if (nextDeposit === 'paid' && current.depositStatus !== 'paid') {
      const paidSum = await sumConfirmedPayments(current.reference, 'reservation');
      if (paidSum < current.depositFcfa) {
        throw new HttpError(
          400,
          `Paiements confirmés insuffisants pour marquer l’acompte payé : ${paidSum} / ${current.depositFcfa} FCFA.`
        );
      }
    }

    const updated = await prisma.reservation.update({
      where: { id: req.params.id },
      data: {
        depositStatus: nextDeposit,
        workflow: nextWorkflow,
      },
    });
    const paidRes = await sumConfirmedPayments(updated.reference, 'reservation');
    res.json(reservationToDto(updated, reservationDepositSummary(updated.depositFcfa, paidRes)));
  } catch (e) {
    next(e);
  }
});

export default router;
