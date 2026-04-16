import fs from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { z } from 'zod';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { listMeta, paginationQuerySchema, resolvePagination } from '../lib/pagination.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { HttpError } from '../middleware/errorHandler.js';

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

async function maybeResizeImage(filePath: string) {
  try {
    const meta = await sharp(filePath).metadata();
    if (!meta.width || meta.width <= 1920) return;
    const tmp = `${filePath}.resize-tmp`;
    await sharp(filePath)
      .resize({ width: 1920, withoutEnlargement: true })
      .toFile(tmp);
    fs.renameSync(tmp, filePath);
  } catch {
    /* conserver le fichier original */
  }
}

function diskPathFromPublicUrl(url: string): string | null {
  if (!url.startsWith('/uploads/')) return null;
  const name = url.slice('/uploads/'.length);
  if (!name || name.includes('..') || path.isAbsolute(name)) return null;
  return path.join(uploadRoot, name);
}

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

      const absPath = path.join(uploadRoot, req.file.filename);
      await maybeResizeImage(absPath);

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

router.get('/', requireAuth, requireRoles('vendeuse', 'admin'), async (req, res, next) => {
  try {
    const q = paginationQuerySchema.parse(req.query);
    const { page, limit, skip } = resolvePagination(q);
    const [items, total] = await Promise.all([
      prisma.mediaAsset.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.mediaAsset.count(),
    ]);
    res.json({ data: items, meta: listMeta(page, limit, total) });
  } catch (e) {
    next(e);
  }
});

router.delete(
  '/:id',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const asset = await prisma.mediaAsset.findUnique({ where: { id: req.params.id } });
      if (!asset) throw new HttpError(404, 'Média introuvable');
      const diskPath = diskPathFromPublicUrl(asset.url);
      if (diskPath && fs.existsSync(diskPath)) {
        try {
          fs.unlinkSync(diskPath);
        } catch {
          /* fichier déjà absent */
        }
      }
      await prisma.mediaAsset.delete({ where: { id: asset.id } });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

export default router;
