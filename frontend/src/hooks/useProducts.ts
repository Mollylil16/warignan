import { useMemo } from 'react';
import { mockProducts } from '../data/mockProducts';
import type { Product } from '../types';

export interface UseProductsResult {
  data: Product[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Catalogue produits — mock pour l’instant ; remplacer par React Query + `api` plus tard.
 */
export function useProducts(): UseProductsResult {
  return useMemo(
    () => ({
      data: mockProducts,
      isLoading: false,
      error: null,
    }),
    []
  );
}
