import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export function useLiveStatus() {
  const q = useQuery({
    queryKey: ['settings', 'live'],
    queryFn: async () => {
      const { data } = await api.get<{ isLive: boolean }>('/settings/live');
      return data.isLive;
    },
    staleTime: 10_000,
    refetchInterval: 60_000,
  });
  return q.data ?? false;
}
