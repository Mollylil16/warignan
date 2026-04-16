import { api } from './api';

export type TrackingApiResult =
  | { kind: 'order'; data: Record<string, unknown> }
  | { kind: 'reservation'; data: Record<string, unknown> }
  | { kind: 'payment'; data: Record<string, unknown> }
  | { kind: 'not_found' };

export async function fetchTracking(reference: string): Promise<TrackingApiResult | null> {
  const ref = reference.trim();
  if (!ref) return null;
  const { data, status } = await api.get<TrackingApiResult | { kind?: string }>(
    `/tracking/${encodeURIComponent(ref)}`,
    { validateStatus: (s) => s === 200 || s === 404 }
  );
  if (status === 404) return { kind: 'not_found' };
  return data as TrackingApiResult;
}
