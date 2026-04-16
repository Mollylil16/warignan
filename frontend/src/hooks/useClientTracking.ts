import { useQuery } from '@tanstack/react-query';
import type { ClientTrackingResult } from '../types/tracking';
import { resolveTrackingFromApi } from '../services/trackingClient';

export function useClientTracking(submittedRef: string | null) {
  const q = useQuery({
    queryKey: ['tracking', submittedRef],
    queryFn: (): Promise<ClientTrackingResult> => resolveTrackingFromApi(submittedRef!),
    enabled: Boolean(submittedRef?.trim()),
    retry: false,
  });

  const result: ClientTrackingResult | null =
    !submittedRef?.trim() || q.isPending ? null : (q.data ?? null);

  return {
    result,
    refresh: () => void q.refetch(),
    lastSyncedAt: q.dataUpdatedAt ? new Date(q.dataUpdatedAt) : null,
    isSyncing: q.isFetching,
    fetchError: q.error instanceof Error ? q.error : null,
    isPending: q.isPending,
  };
}
