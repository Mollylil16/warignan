import { Router } from 'express';

const router = Router();

/**
 * EXERCICE_JUNIOR : CRUD livraisons, assignation livreur, filtres par date / statut.
 * Le modèle Prisma `Delivery` est déjà défini.
 */
router.get('/', (_req, res) => {
  res.status(501).json({
    error: 'NOT_IMPLEMENTED',
    message:
      'Route réservée à l’exercice junior — voir docs/EXERCICE_JUNIOR_BACKEND.md (section Livraisons).',
  });
});

export default router;
