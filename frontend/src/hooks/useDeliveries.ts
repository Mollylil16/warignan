import { useMemo } from 'react';
import { mockDeliveries, type MockDelivery } from '../data/vendeuseMock';

export interface UseDeliveriesResult {
  data: MockDelivery[];
  isLoading: boolean;
  error: Error | null;
}

export function useDeliveries(): UseDeliveriesResult {
  return useMemo(
    () => ({
      data: mockDeliveries,
      isLoading: false,
      error: null,
    }),
    []
  );
}
