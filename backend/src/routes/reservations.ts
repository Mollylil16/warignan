import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth, requireRoles('vendeuse', 'admin'));

/**
 * Liste des réservations — opérationnelle.
 * Mise à jour du workflow / acompte : EXERCICE_JUNIOR (voir docs/EXERCICE_JUNIOR_BACKEND.md).
 */
router.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.reservation.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({
      data: rows.map((r) => ({
        id: r.id,
        reference: r.reference,
        clientName: r.clientName,
        clientPhone: r.clientPhone,
        productsSummary: r.productsSummary,
        totalFcfa: r.totalFcfa,
        depositFcfa: r.depositFcfa,
        depositStatus: r.depositStatus,
        workflow: r.workflow,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
