import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { mapApiProduct, type ApiProductRow } from '../services/mappers';
import type { Product } from '../types';

export function useProduct(id: string | undefined) {
  const q = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<ApiProductRow>(`/products/${id}`);
      return mapApiProduct(data);
    },
    enabled: Boolean(id),
  });
  return {
    data: (q.data ?? null) as Product | null,
    isLoading: q.isPending,
    error: q.error instanceof Error ? q.error : q.error ? new Error('Erreur produit') : null,
  };
}
