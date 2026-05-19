import { Router } from 'express';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

// État en mémoire — non persisté (redémarrage remet isLive à false)
let isLive = false;

router.get('/live', (_req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=10, stale-while-revalidate=20');
  res.json({ isLive });
});

router.patch('/live', requireAuth, requireRoles('vendeuse', 'admin'), (req, res) => {
  const body = req.body as { isLive?: unknown };
  if (typeof body.isLive !== 'boolean') {
    res.status(400).json({ error: 'isLive doit être un booléen' });
    return;
  }
  isLive = body.isLive;
  res.json({ isLive });
});

export default router;
