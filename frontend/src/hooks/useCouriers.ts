import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type CourierRow = { id: string; email: string; displayName: string };

export function useCouriers() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['users', 'couriers', token],
    queryFn: async () => {
      const { data } = await api.get<{ data: CourierRow[] }>('/users/couriers');
      return data.data;
    },
    enabled: Boolean(token),
  });
}

export async function createCourier(body: { displayName: string; email: string }) {
  const { data } = await api.post<CourierRow>('/users/couriers', body);
  return data;
}

export async function patchCourier(id: string, body: { displayName?: string; email?: string }) {
  const { data } = await api.patch<CourierRow>(`/users/couriers/${id}`, body);
  return data;
}

export async function deleteCourier(id: string) {
  await api.delete(`/users/couriers/${id}`);
}
