import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const courierCreateSchema = z.object({
  displayName: z.string().min(1).max(120),
  email: z.string().email(),
});

const courierPatchSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
  email: z.string().email().optional(),
});

router.get(
  '/couriers',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (_req, res, next) => {
    try {
      const rows = await prisma.user.findMany({
        where: { role: 'livreur' },
        orderBy: { displayName: 'asc' },
        select: { id: true, email: true, displayName: true },
      });
      res.json({ data: rows });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/couriers',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const body = courierCreateSchema.parse(req.body);
      const exists = await prisma.user.findUnique({ where: { email: body.email } });
      if (exists) throw new HttpError(409, 'Email déjà utilisé');
      const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
      const created = await prisma.user.create({
        data: {
          email: body.email,
          displayName: body.displayName,
          passwordHash,
          role: 'livreur',
        },
        select: { id: true, email: true, displayName: true },
      });
      res.status(201).json(created);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/couriers/:id',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const body = courierPatchSchema.parse(req.body);
      if (body.displayName === undefined && body.email === undefined) {
        throw new HttpError(400, 'Aucun champ à modifier');
      }
      const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.role !== 'livreur') throw new HttpError(404, 'Livreur introuvable');
      if (body.email && body.email !== existing.email) {
        const clash = await prisma.user.findUnique({ where: { email: body.email } });
        if (clash) throw new HttpError(409, 'Email déjà utilisé');
      }
      const updated = await prisma.user.update({
        where: { id: req.params.id },
        data: {
          ...(body.displayName !== undefined ? { displayName: body.displayName } : {}),
          ...(body.email !== undefined ? { email: body.email } : {}),
        },
        select: { id: true, email: true, displayName: true },
      });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/couriers/:id',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const existing = await prisma.user.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.role !== 'livreur') throw new HttpError(404, 'Livreur introuvable');
      await prisma.user.delete({ where: { id: req.params.id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

router.get('/', requireAuth, requireRoles('admin'), async (_req, res, next) => {
  try {
    const rows = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });
    res.json({
      data: rows.map((u) => ({
        ...u,
        createdAt: u.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
