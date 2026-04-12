import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';

const router = Router();

const uploadRoot = path.resolve(env.UPLOAD_DIR);
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadRoot),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Seules les images sont acceptées'));
      return;
    }
    cb(null, true);
  },
});

/**
 * Upload local + enregistrement DB — ~70 %.
 * EXERCICE_JUNIOR : redimensionnement serveur, S3, suppression fichier orphelin, droits par galerie.
 */
router.post(
  '/',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  (req, res, next) => {
    upload.single('file')(req, res, (err) => {
      if (err) return next(err);
      next();
    });
  },
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Fichier manquant (champ form « file »)' });
      }
      const meta = z
        .object({
          gallery: z
            .enum(['robes', 'crops', 'live', 'banners', 'uncategorized'])
            .optional(),
          isPrimary: z.coerce.boolean().optional(),
        })
        .parse(req.body);

      const publicUrl = `/uploads/${req.file.filename}`;
      const asset = await prisma.mediaAsset.create({
        data: {
          url: publicUrl,
          filename: req.file.originalname,
          gallery: meta.gallery ?? 'uncategorized',
          isPrimary: meta.isPrimary ?? false,
        },
      });
      res.status(201).json(asset);
    } catch (e) {
      next(e);
    }
  }
);

router.get('/', requireAuth, requireRoles('vendeuse', 'admin'), async (_req, res, next) => {
  try {
    const items = await prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ data: items });
  } catch (e) {
    next(e);
  }
});

export default router;
