import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type StaffReservationRow = {
  id: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  productsSummary: string;
  subtotalFcfa?: number;
  discountFcfa?: number;
  promoCode?: string | null;
  totalFcfa: number;
  depositFcfa: number;
  depositStatus: string;
  workflow: string;
  createdAt: string;
};

export function useReservationsList(params?: {
  q?: string;
  workflow?: string;
  depositStatus?: string;
  fromISO?: string;
  toISO?: string;
}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [
      'reservations',
      'staff',
      token,
      params?.q ?? '',
      params?.workflow ?? '',
      params?.depositStatus ?? '',
      params?.fromISO ?? '',
      params?.toISO ?? '',
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffReservationRow[] }>('/reservations', {
        params: { page: 1, limit: 200, ...params },
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}
