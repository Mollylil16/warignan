import { useMemo } from 'react';
import { mockOrders, type MockOrder } from '../data/vendeuseMock';

export interface UseOrdersResult {
  data: MockOrder[];
  isLoading: boolean;
  error: Error | null;
}

export function useOrders(): UseOrdersResult {
  return useMemo(
    () => ({
      data: mockOrders,
      isLoading: false,
      error: null,
    }),
    []
  );
}
