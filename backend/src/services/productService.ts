import type { Prisma, ProductCategory } from '@prisma/client';
import { prisma } from '../lib/prisma.js';

export type ListProductsQuery = {
  category?: 'ALL' | 'ROBE' | 'CROP';
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'popular' | 'newest' | 'oldest';
  q?: string;
  page?: number;
  limit?: number;
};

function asStringArray(json: unknown): string[] {
  if (Array.isArray(json) && json.every((x) => typeof x === 'string')) {
    return json as string[];
  }
  return [];
}

export function productToDto(p: {
  id: string;
  code: string;
  nom: string;
  description: string;
  prix: number;
  category: ProductCategory;
  status: string;
  imageName: unknown;
  stock: number;
  featured: boolean;
  createdAt: Date;
}) {
  return {
    id: p.id,
    code: p.code,
    nom: p.nom,
    description: p.description,
    prix: p.prix,
    category: p.category,
    status: p.status,
    imageName: asStringArray(p.imageName),
    stock: p.stock,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function listProducts(query: ListProductsQuery) {
  const where: Prisma.ProductWhereInput = {};

  if (query.category && query.category !== 'ALL') {
    const map: Record<string, ProductCategory> = {
      ROBE: 'robe',
      CROP: 'crop',
    };
    where.category = map[query.category];
  }

  if (query.maxPrice != null && !Number.isNaN(query.maxPrice)) {
    where.prix = { lte: query.maxPrice };
  }

  if (query.q?.trim()) {
    const s = query.q.trim();
    where.OR = [
      { nom: { contains: s } },
      { code: { contains: s } },
      { description: { contains: s } },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: 'desc' }];
  switch (query.sortBy) {
    case 'price-asc':
      orderBy = [{ prix: 'asc' }];
      break;
    case 'price-desc':
      orderBy = [{ prix: 'desc' }];
      break;
    case 'oldest':
      orderBy = [{ createdAt: 'asc' }];
      break;
    case 'popular':
      orderBy = [{ featured: 'desc' }, { createdAt: 'desc' }];
      break;
    case 'newest':
    default:
      orderBy = [{ createdAt: 'desc' }];
      break;
  }

  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const skip = (page - 1) * limit;

  const [rows, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, skip, take: limit }),
    prisma.product.count({ where }),
  ]);
  return { items: rows.map(productToDto), total, page, limit };
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({ where: { id } });
}

export async function createProduct(data: Prisma.ProductCreateInput) {
  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.update({ where: { id }, data });
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
}
