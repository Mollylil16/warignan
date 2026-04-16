import type { OrderStep, ReservationWorkflow, DepositStatus } from '../types/domain';
import type { ApiPaymentEventRow, ClientTrackingResult } from '../types/tracking';
import { fetchTracking } from './trackingApi';

function normalizeRef(s: string) {
  return s.trim().toUpperCase();
}

/**
 * Suivi strictement via l’API (aucun mock ni localStorage).
 */
export async function resolveTrackingFromApi(rawRef: string): Promise<ClientTrackingResult> {
  const ref = normalizeRef(rawRef);
  if (!ref) return { kind: 'empty' };

  const api = await fetchTracking(ref);

  if (!api || api.kind === 'not_found') {
    return { kind: 'not_found', ref };
  }

  if (api.kind === 'order') {
    const d = api.data as Record<string, unknown>;
    return {
      kind: 'order',
      order: {
        id: String(d.reference ?? ref),
        reference: String(d.reference ?? ref),
        clientName: String(d.clientName ?? ''),
        city: String(d.city ?? ''),
        itemsSummary: String(d.itemsSummary ?? ''),
        subtotalFcfa: Number(d.subtotalFcfa ?? 0),
        discountFcfa: Number(d.discountFcfa ?? 0),
        promoCode: (d.promoCode as string | null | undefined) ?? null,
        totalFcfa: Number(d.totalFcfa ?? 0),
        paidAt: (d.paidAt as string | null | undefined) ?? null,
        step: (d.step as OrderStep) ?? 'preparation',
      },
    };
  }

  if (api.kind === 'reservation') {
    const d = api.data as Record<string, unknown>;
    return {
      kind: 'reservation',
      reservation: {
        id: String(d.reference ?? ref),
        reference: String(d.reference ?? ref),
        clientName: String(d.clientName ?? ''),
        clientPhone: String(d.clientPhone ?? ''),
        productsSummary: String(d.productsSummary ?? ''),
        subtotalFcfa: Number(d.subtotalFcfa ?? 0),
        discountFcfa: Number(d.discountFcfa ?? 0),
        promoCode: (d.promoCode as string | null | undefined) ?? null,
        totalFcfa: Number(d.totalFcfa ?? 0),
        depositFcfa: Number(d.depositFcfa ?? 0),
        depositStatus: (d.depositStatus as DepositStatus) ?? 'pending',
        workflow: (d.workflow as ReservationWorkflow) ?? 'awaiting_deposit',
        createdAt: String(d.createdAt ?? new Date().toISOString()),
      },
    };
  }

  if (api.kind === 'payment') {
    const d = api.data as { reference?: string; events?: unknown[] };
    const events = (d.events ?? []) as ApiPaymentEventRow[];
    return {
      kind: 'api_payment',
      reference: d.reference ?? ref,
      events,
    };
  }

  return { kind: 'not_found', ref };
}
