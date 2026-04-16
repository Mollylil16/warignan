import type { DeliveryStatus, Prisma, Role } from '@prisma/client';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { listMeta, paginationQuerySchema, resolvePagination } from '../lib/pagination.js';
import { requireAuth } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const listQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['planned', 'assigned', 'out', 'done']).optional(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  orderRef: z.string().optional(),
});

const patchBodySchema = z.object({
  courierId: z.string().min(1).nullable().optional(),
  status: z.enum(['planned', 'assigned', 'out', 'done']).optional(),
});

function deliveryToDto(d: {
  id: string;
  orderRef: string;
  clientName: string;
  address: string;
  dateISO: string;
  windowLabel: string;
  courierId: string | null;
  status: DeliveryStatus;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: d.id,
    orderRef: d.orderRef,
    clientName: d.clientName,
    address: d.address,
    dateISO: d.dateISO,
    windowLabel: d.windowLabel,
    courierId: d.courierId,
    status: d.status,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  };
}

function assertStaff(role: Role) {
  if (role !== 'vendeuse' && role !== 'admin' && role !== 'livreur') {
    throw new HttpError(403, 'Droits insuffisants');
  }
}

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const role = req.user!.role;
    assertStaff(role);
    const q = listQuerySchema.parse(req.query);
    const { page, limit, skip } = resolvePagination(q);

    const where: Prisma.DeliveryWhereInput = {};
    if (q.status) where.status = q.status;
    if (q.dateISO) where.dateISO = q.dateISO;
    if (q.orderRef?.trim()) where.orderRef = { contains: q.orderRef.trim() };

    if (role === 'livreur') {
      where.courierId = req.user!.sub;
    }

    const [rows, total] = await Promise.all([
      prisma.delivery.findMany({ where, orderBy: { dateISO: 'asc' }, skip, take: limit }),
      prisma.delivery.count({ where }),
    ]);

    res.json({
      data: rows.map(deliveryToDto),
      meta: listMeta(page, limit, total),
    });
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const role = req.user!.role;
    assertStaff(role);
    const body = patchBodySchema.parse(req.body);
    if (body.courierId === undefined && body.status === undefined) {
      throw new HttpError(400, 'Indiquez au moins courierId ou status');
    }

    const existing = await prisma.delivery.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new HttpError(404, 'Livraison introuvable');

    if (role === 'livreur') {
      if (existing.courierId !== req.user!.sub) {
        throw new HttpError(403, 'Cette livraison ne vous est pas assignée');
      }
      if (body.courierId !== undefined) {
        throw new HttpError(403, 'Seule la vendeuse ou l’admin peut assigner un livreur');
      }
      if (body.status !== undefined) {
        if (body.status === 'planned' || body.status === 'assigned') {
          throw new HttpError(403, 'Transition de statut non autorisée pour le livreur');
        }
        if (existing.status === 'assigned' && body.status !== 'out') {
          throw new HttpError(400, 'Depuis « assigned », seul le statut « out » est autorisé');
        }
        if (existing.status === 'out' && body.status !== 'done') {
          throw new HttpError(400, 'Depuis « out », seul le statut « done » est autorisé');
        }
        if (existing.status === 'done') {
          throw new HttpError(400, 'Livraison déjà terminée');
        }
        if (existing.status === 'planned') {
          throw new HttpError(400, 'Livraison pas encore assignée');
        }
      }
    }

    if (role === 'vendeuse' || role === 'admin') {
      if (body.status === 'assigned' && body.courierId === undefined && !existing.courierId) {
        throw new HttpError(400, 'Assignez un livreur (courierId) pour passer en « assigned »');
      }
    }

    const data: { courierId?: string | null; status?: DeliveryStatus } = {};
    if (body.courierId !== undefined) data.courierId = body.courierId;
    if (body.status !== undefined) data.status = body.status;

    const updated = await prisma.delivery.update({
      where: { id: req.params.id },
      data,
    });
    res.json(deliveryToDto(updated));
  } catch (e) {
    next(e);
  }
});

export default router;
