import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type StaffOrderRow = {
  id: string;
  reference: string;
  clientName: string;
  city: string;
  itemsSummary: string;
  subtotalFcfa?: number;
  discountFcfa?: number;
  promoCode?: string | null;
  totalFcfa: number;
  paidAt: string | null;
  step: string;
  createdAt: string;
};

export function useOrdersList(params?: {
  q?: string;
  step?: string;
  city?: string;
  minTotalFcfa?: number;
  maxTotalFcfa?: number;
  fromISO?: string;
  toISO?: string;
}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [
      'orders',
      'staff',
      token,
      params?.q ?? '',
      params?.step ?? '',
      params?.city ?? '',
      params?.minTotalFcfa ?? '',
      params?.maxTotalFcfa ?? '',
      params?.fromISO ?? '',
      params?.toISO ?? '',
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffOrderRow[] }>('/orders', {
        params: { page: 1, limit: 200, ...params },
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}
