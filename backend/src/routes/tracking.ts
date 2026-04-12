import { Router } from 'express';
import { z } from 'zod';
import { resolveTracking } from '../services/trackingService.js';

const router = Router();

router.get('/:reference', async (req, res, next) => {
  try {
    const ref = z.string().min(3).parse(req.params.reference);
    const result = await resolveTracking(ref);
    if (result.kind === 'not_found') {
      return res.status(404).json({ error: 'Référence introuvable', kind: 'not_found' });
    }
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
