import { ProductCategory, ProductStatus, type Product } from '../types';

export type ApiProductRow = {
  id: string;
  code: string;
  nom: string;
  description: string;
  prix: number;
  category: string;
  status: string;
  imageName: string[];
  stock: number;
  featured?: boolean;
  createdAt: string;
};

function mapCategory(c: string): ProductCategory {
  if (c === 'crop') return ProductCategory.CROP;
  return ProductCategory.ROBE;
}

function mapStatus(s: string): ProductStatus {
  if (s === 'reserver') return ProductStatus.RESERVER;
  if (s === 'sold') return ProductStatus.SOLD;
  return ProductStatus.DISPONIBLE;
}

export function mapApiProduct(row: ApiProductRow): Product {
  return {
    id: row.id,
    code: row.code,
    nom: row.nom,
    description: row.description ?? '',
    prix: row.prix,
    category: mapCategory(row.category),
    status: mapStatus(row.status),
    createdAt: row.createdAt,
    imageName: Array.isArray(row.imageName) ? row.imageName : [],
    stock: row.stock ?? 0,
    featured: Boolean(row.featured),
  };
}
