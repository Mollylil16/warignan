import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

router.get('/live', async (_req, res, next) => {
  try {
    res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
    const setting = await prisma.setting.findUnique({
      where: { key: 'isLive' },
    });
    const isLive = setting?.value === 'true';
    res.json({ isLive });
  } catch (error) {
    next(error);
  }
});

router.patch('/live', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const body = req.body as { isLive?: unknown };
    if (typeof body.isLive !== 'boolean') {
      res.status(400).json({ error: 'isLive doit être un booléen' });
      return;
    }
    const setting = await prisma.setting.upsert({
      where: { key: 'isLive' },
      update: { value: String(body.isLive) },
      create: { key: 'isLive', value: String(body.isLive) },
    });
    const isLive = setting.value === 'true';
    res.json({ isLive });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-test-data', requireAuth, requireRoles('admin'), async (_req, res, next) => {
  try {
    await prisma.paymentIntent.deleteMany();
    await prisma.paymentEvent.deleteMany();
    await prisma.mediaAsset.deleteMany();
    await prisma.delivery.deleteMany();
    await prisma.order.deleteMany();
    await prisma.reservation.deleteMany();
    await prisma.product.deleteMany();
    await prisma.promotion.deleteMany();

    res.json({ message: 'Toutes les données de test (commandes, paiements, réservations, événements, produits, médias, promotions) ont été supprimées avec succès.' });
  } catch (error) {
    next(error);
  }
});

export default router;
