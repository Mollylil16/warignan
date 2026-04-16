import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

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
