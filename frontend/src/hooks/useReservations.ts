import { useMemo } from 'react';
import { mockReservations, type MockReservation } from '../data/vendeuseMock';

export interface UseReservationsResult {
  data: MockReservation[];
  isLoading: boolean;
  error: Error | null;
}

export function useReservations(): UseReservationsResult {
  return useMemo(
    () => ({
      data: mockReservations,
      isLoading: false,
      error: null,
    }),
    []
  );
}
