import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { mapApiProduct, type ApiProductRow } from '../services/mappers';
import type { Product } from '../types';

export function useProducts() {
  const q = useQuery({
    queryKey: ['products', { page: 1, limit: 200 }],
    queryFn: async () => {
      const { data } = await api.get<{ data: ApiProductRow[] }>('/products', {
        params: { page: 1, limit: 200 },
      });
      return data.data.map(mapApiProduct);
    },
  });
  return {
    data: (q.data ?? []) as Product[],
    isLoading: q.isPending,
    error: q.error instanceof Error ? q.error : q.error ? new Error('Erreur catalogue') : null,
    refetch: q.refetch,
  };
}
