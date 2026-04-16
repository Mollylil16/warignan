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
