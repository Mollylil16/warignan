import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type DeliveryRow = {
  id: string;
  orderRef: string;
  clientName: string;
  address: string;
  dateISO: string;
  windowLabel: string;
  courierId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export function useDeliveriesList(params?: { status?: string; dateISO?: string }) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['deliveries', token, params?.status, params?.dateISO],
    queryFn: async () => {
      const { data } = await api.get<{ data: DeliveryRow[] }>('/deliveries', {
        params: { page: 1, limit: 500, ...params },
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}
