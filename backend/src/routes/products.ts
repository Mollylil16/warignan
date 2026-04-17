import { Router } from 'express';
import type { Prisma } from '@prisma/client';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import {
  createProduct,
  getProductById,
  listProducts,
  productToDto,
  updateProduct,
} from '../services/productService.js';
import { requireAuth, requireRoles } from '../middleware/auth.js';
import { listMeta, paginationQuerySchema } from '../lib/pagination.js';
import { HttpError } from '../middleware/errorHandler.js';

const router = Router();

const listQuerySchema = paginationQuerySchema.extend({
  category: z.enum(['ALL', 'ROBE', 'CROP']).optional(),
  maxPrice: z.coerce.number().optional(),
  sortBy: z
    .enum(['price-asc', 'price-desc', 'popular', 'newest', 'oldest'])
    .optional(),
  q: z.string().optional(),
});

const createBodySchema = z.object({
  code: z.string().min(1).max(32).optional(),
  nom: z.string().min(1).max(200),
  description: z.string().max(2000).default(''),
  prix: z.number().int().positive(),
  category: z.enum(['robe', 'crop']),
  status: z.enum(['disponible', 'reserver', 'sold']).optional(),
  imageName: z.array(z.string()).min(1),
  stock: z.number().int().min(0),
  featured: z.boolean().optional(),
});

const patchBodySchema = createBodySchema.partial();

function genProductCode(category: 'robe' | 'crop') {
  const prefix = category === 'robe' ? 'RB' : 'CR';
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

router.get('/', async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const { items, total, page, limit } = await listProducts(q);
    res.json({ data: items, meta: listMeta(page, limit, total) });
  } catch (e) {
    next(e);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await getProductById(req.params.id);
    if (!p) throw new HttpError(404, 'Produit introuvable');
    res.json(productToDto(p));
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const body = createBodySchema.parse(req.body);
      let code = (body.code ?? '').trim().toUpperCase();
      if (!code) {
        code = genProductCode(body.category);
        for (let i = 0; i < 10; i++) {
          const clash = await prisma.product.findUnique({ where: { code } });
          if (!clash) break;
          code = genProductCode(body.category);
        }
      } else {
        const exists = await prisma.product.findUnique({ where: { code } });
        if (exists) throw new HttpError(409, 'Code produit déjà utilisé');
      }
      const created = await createProduct({
        code,
        nom: body.nom,
        description: body.description,
        prix: body.prix,
        category: body.category,
        status: body.status ?? 'disponible',
        imageName: body.imageName,
        stock: body.stock,
        featured: body.featured ?? false,
      });
      res.status(201).json(productToDto(created));
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/:id',
  requireAuth,
  requireRoles('vendeuse', 'admin'),
  async (req, res, next) => {
    try {
      const body = patchBodySchema.parse(req.body);
      const existing = await getProductById(req.params.id);
      if (!existing) throw new HttpError(404, 'Produit introuvable');
      const data = Object.fromEntries(
        Object.entries(body).filter(([, v]) => v !== undefined)
      ) as Record<string, unknown>;
      if (Object.keys(data).length === 0) {
        throw new HttpError(400, 'Aucun champ à modifier');
      }
      const updated = await updateProduct(
        req.params.id,
        data as Prisma.ProductUpdateInput
      );
      res.json(productToDto(updated));
    } catch (e) {
      next(e);
    }
  }
);

export default router;
