import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { ApiProductRow } from '../services/mappers';
import { STAFF_LIST_LIMIT } from '../constants/apiPagination';

export type StaffProductRow = ApiProductRow;

export function useStaffProductsList() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['products', 'staff', token],
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffProductRow[] }>('/products', {
        params: { page: 1, limit: STAFF_LIST_LIMIT },
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}

export function useStaffProductMutations() {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: {
      code?: string;
      nom: string;
      description?: string;
      prix: number;
      category: 'robe' | 'crop';
      status?: 'disponible' | 'reserver' | 'sold';
      imageName: string[];
      stock: number;
      featured?: boolean;
    }) => {
      const { data } = await api.post<StaffProductRow>('/products', body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const patch = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<StaffProductRow> }) => {
      const { data } = await api.patch<StaffProductRow>(`/products/${id}`, body);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });

  return { create, patch, remove };
}

