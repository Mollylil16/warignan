import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();
router.use(requireAuth, requireRoles('vendeuse', 'admin'));

// Caractères sans ambiguïté visuelle (sans I, O, 0, 1)
const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function genPassword(length = 6): string {
  const bytes = crypto.randomBytes(length);
  return Array.from(bytes)
    .map((b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length])
    .join('');
}

// Convertit le premier mot du nom en slug simple pour l'email interne
function slugifyFirst(name: string): string {
  return (
    name
      .split(/\s+/)[0]
      ?.toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '') // supprimer accents
      .replace(/[^a-z0-9]/g, '') || 'livreur'
  );
}

// Génère un email fictif interne non communiqué : prenom-XXXX@warignan.local
async function genInternalEmail(displayName: string): Promise<string> {
  const base = slugifyFirst(displayName);
  for (let i = 0; i < 20; i++) {
    const digits = Math.floor(Math.random() * 9000 + 1000);
    const email = `${base}-${digits}@warignan.local`;
    const exists = await prisma.user.findUnique({ where: { email } });
    if (!exists) return email;
  }
  throw new Error('Impossible de générer un email interne unique — réessayez');
}

const createSchema = z.object({
  displayName: z.string().min(1).max(120).trim(),
  phone: z.string().min(1).max(30).trim(),
});

/**
 * GET /api/admin/livreurs
 * Liste tous les livreurs — sans email interne.
 *
 * curl http://localhost:4001/api/admin/livreurs -H "Authorization: Bearer <token>"
 */
router.get('/', async (_req, res, next) => {
  try {
    const rows = await prisma.user.findMany({
      where: { role: 'livreur' },
      orderBy: { displayName: 'asc' },
      select: { id: true, displayName: true, phone: true, createdAt: true },
    });

    // Pour chaque livreur, compter ses livraisons actives
    const ids = rows.map((r) => r.id);
    const activeCounts = await Promise.all(
      ids.map((id) =>
        prisma.delivery.count({ where: { courierId: id, status: { not: 'done' } } })
      )
    );

    res.json({
      data: rows.map((r, i) => ({
        id: r.id,
        displayName: r.displayName,
        phone: r.phone ?? null,
        createdAt: r.createdAt.toISOString(),
        livraisonsActives: activeCounts[i],
      })),
    });
  } catch (e) {
    next(e);
  }
});

/**
 * POST /api/admin/livreurs
 * Crée un livreur sans email — génère mot de passe + email interne.
 * Le mot de passe est retourné une seule fois, jamais stocké en clair.
 *
 * curl -X POST http://localhost:4001/api/admin/livreurs \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{"displayName":"Koné Mamadou","phone":"0708091011"}'
 */
router.post('/', async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);

    const motDePasse = genPassword(6);
    const internalEmail = await genInternalEmail(body.displayName);
    const passwordHash = await bcrypt.hash(motDePasse, 10);

    const user = await prisma.user.create({
      data: {
        email: internalEmail,
        displayName: body.displayName,
        phone: body.phone,
        passwordHash,
        role: 'livreur',
      },
      select: { id: true, displayName: true, phone: true, createdAt: true },
    });

    res.status(201).json({
      id: user.id,
      displayName: user.displayName,
      phone: user.phone ?? null,
      createdAt: user.createdAt.toISOString(),
      motDePasse,
      message: 'Compte créé. Notez bien le mot de passe, il ne sera plus affiché.',
    });
  } catch (e) {
    next(e);
  }
});

/**
 * DELETE /api/admin/livreurs/:id
 * Supprime un livreur seulement si toutes ses livraisons sont terminées.
 *
 * curl -X DELETE http://localhost:4001/api/admin/livreurs/<id> \
 *   -H "Authorization: Bearer <token>"
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.role !== 'livreur') throw new HttpError(404, 'Livreur introuvable');

    const actives = await prisma.delivery.count({
      where: { courierId: req.params.id, status: { not: 'done' } },
    });
    if (actives > 0) {
      throw new HttpError(
        400,
        `Ce livreur a ${actives} livraison(s) active(s). Terminez-les avant de supprimer le compte.`
      );
    }

    await prisma.user.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

export default router;
