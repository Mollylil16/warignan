import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useOrderCourierMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; courierId: string | null; courierName?: string | null }) => {
      const { data } = await api.patch<{ id: string; courierId: string | null; courierName: string | null }>(
        `/orders/${args.id}/courier`,
        { courierId: args.courierId, courierName: args.courierName ?? null }
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}

