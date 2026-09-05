import { prisma } from '../lib/prisma.js';
import { parseItemsSummary } from './paymentTotals.js';

export type OrderItemDetail = {
  code: string;
  qty: number;
  nom: string | null;
  prix: number | null;
  image: string | null;
  images: string[];
};

export function parseProductImageUrls(imageName: unknown): string[] {
  if (Array.isArray(imageName)) {
    return imageName.map(String).filter(Boolean);
  }
  if (typeof imageName === 'string') {
    try {
      const parsed = JSON.parse(imageName);
      if (Array.isArray(parsed)) {
        return parsed.map(String).filter(Boolean);
      }
      if (typeof parsed === 'string' && parsed.trim()) {
        return [parsed.trim()];
      }
    } catch {
      if (imageName.trim()) {
        return [imageName.trim()];
      }
    }
  }
  return [];
}

type ProductMinimal = {
  code: string;
  nom: string;
  prix: number;
  imageName: unknown;
};

export function buildEnrichedItems(
  summary: string,
  productMap: Map<string, ProductMinimal>
): OrderItemDetail[] {
  const lines = parseItemsSummary(summary);
  return lines.map((line) => {
    const prod = productMap.get(line.code);
    const images = prod ? parseProductImageUrls(prod.imageName) : [];
    return {
      code: line.code,
      qty: line.qty,
      nom: prod?.nom ?? null,
      prix: prod?.prix ?? null,
      image: images[0] ?? null,
      images,
    };
  });
}

/**
 * Charge tous les produits pour une liste de résumés d'articles ("CR-123 ×1, RB-456 ×2")
 * et retourne un mapping indexé par le résumé original.
 */
export async function enrichSummariesWithProducts(
  summaries: string[]
): Promise<Map<string, OrderItemDetail[]>> {
  const allCodes = Array.from(
    new Set(summaries.flatMap((s) => parseItemsSummary(s).map((i) => i.code)))
  );

  const products: ProductMinimal[] =
    allCodes.length > 0
      ? await prisma.product.findMany({
          where: { code: { in: allCodes } },
          select: { code: true, nom: true, prix: true, imageName: true },
        })
      : [];

  const productMap = new Map(products.map((p) => [p.code, p]));
  const result = new Map<string, OrderItemDetail[]>();

  for (const s of summaries) {
    result.set(s, buildEnrichedItems(s, productMap));
  }

  return result;
}

/**
 * Enrichit un résumé unique en interrogeant la base de données.
 */
export async function enrichSingleSummary(summary: string): Promise<OrderItemDetail[]> {
  const lines = parseItemsSummary(summary);
  if (lines.length === 0) return [];

  const codes = lines.map((l) => l.code);
  const products: ProductMinimal[] = await prisma.product.findMany({
    where: { code: { in: codes } },
    select: { code: true, nom: true, prix: true, imageName: true },
  });

  const productMap = new Map(products.map((p) => [p.code, p]));
  return buildEnrichedItems(summary, productMap);
}
