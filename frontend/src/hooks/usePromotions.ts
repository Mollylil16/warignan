import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';
import type { PromotionTypeApi } from '../types/domain';

export type PromotionRow = {
  id: string;
  code: string;
  label: string;
  type: PromotionTypeApi;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  createdAt: string;
};

export function usePromotionsList() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['promotions', 'staff', token],
    queryFn: async () => {
      const { data } = await api.get<{ data: PromotionRow[] }>('/promotions', {
        params: { page: 1, limit: 100 },
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}

export function useActivePromotionsCount() {
  return useQuery({
    queryKey: ['promotions', 'active'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PromotionRow[] }>('/promotions/active');
      return data.data.length;
    },
  });
}

export function useActivePromotions() {
  return useQuery({
    queryKey: ['promotions', 'active', 'list'],
    queryFn: async () => {
      const { data } = await api.get<{ data: PromotionRow[] }>('/promotions/active');
      return data.data;
    },
  });
}

export function usePromotionMutations() {
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (body: {
      code: string;
      label: string;
      type: PromotionTypeApi;
      value: number;
      startDate: string;
      endDate: string;
      active?: boolean;
    }) => {
      const { data } = await api.post<PromotionRow>('/promotions', body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
  const patch = useMutation({
    mutationFn: async ({ id, body }: { id: string; body: Partial<PromotionRow> }) => {
      const { data } = await api.patch<PromotionRow>(`/promotions/${id}`, body);
      return data;
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/promotions/${id}`);
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['promotions'] });
    },
  });
  return { create, patch, remove };
}

export type PromotionStatsRow = PromotionRow & {
  uses: number;
  discountFcfa: number;
  usesOrders: number;
  usesReservations: number;
  warnings: string[];
};

export function usePromotionStats(params?: { fromISO?: string; toISO?: string }) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['promotions', 'stats', token, params?.fromISO ?? '', params?.toISO ?? ''],
    queryFn: async () => {
      const { data } = await api.get<{ data: PromotionStatsRow[] }>('/promotions/stats', {
        params,
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}
