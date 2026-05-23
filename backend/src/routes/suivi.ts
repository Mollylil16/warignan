import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

// Libellés français des statuts de livraison
const STATUT_LIBELLE: Record<string, string> = {
  planned: 'En préparation',
  assigned: 'Pris en charge par le livreur',
  out: 'En cours de livraison',
  done: 'Livré',
};

/**
 * GET /api/suivi/:numeroSuivi
 * Public — pas d'authentification requise.
 * Retourne le statut de la livraison identifiée par son numéro WRG-XXXXXX.
 *
 * Exemple : curl http://localhost:4001/api/suivi/WRG-482910
 */
router.get('/:numeroSuivi', async (req, res, next) => {
  try {
    const ref = req.params.numeroSuivi.trim().toUpperCase();
    const delivery = await prisma.delivery.findUnique({
      where: { numeroSuivi: ref },
    });

    if (!delivery) {
      throw new HttpError(404, `Aucune livraison trouvée pour le numéro ${ref}`);
    }

    // Récupérer le nom du livreur si assigné
    let courierDisplayName: string | null = null;
    if (delivery.courierId) {
      const courier = await prisma.user.findUnique({
        where: { id: delivery.courierId },
        select: { displayName: true },
      });
      courierDisplayName = courier?.displayName ?? null;
    }

    res.json({
      numeroSuivi: delivery.numeroSuivi,
      orderRef: delivery.orderRef,
      clientName: delivery.clientName,
      address: delivery.address,
      dateISO: delivery.dateISO,
      windowLabel: delivery.windowLabel,
      status: delivery.status,
      statusLibelle: STATUT_LIBELLE[delivery.status] ?? delivery.status,
      courierName: courierDisplayName,
      createdAt: delivery.createdAt.toISOString(),
      updatedAt: delivery.updatedAt.toISOString(),
    });
  } catch (e) {
    next(e);
  }
});

export default router;
