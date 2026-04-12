import type { PaymentFlow } from '../config/paymentLinks';

const STORAGE_KEY = 'warignan-demo-payment-refs';

/** Cycle de vie côté client jusqu’à synchro backend / webhooks. */
export type DemoPaymentLifecycle =
  | 'saved'
  | 'redirected'
  | 'return_success'
  | 'return_cancel'
  | 'ack_vendeuse';

export interface SavedPaymentRef {
  reference: string;
  flow: PaymentFlow;
  amountFcfa: number;
  savedAt: string;
  lifecycle?: DemoPaymentLifecycle;
  /** Dernière redirection vers un opérateur (Wave / OM). */
  lastRedirectAt?: string;
  /** Retour utilisateur après paiement (URL de retour). */
  returnSeenAt?: string;
}

function parseList(): SavedPaymentRef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (x): x is SavedPaymentRef =>
        typeof x === 'object' &&
        x !== null &&
        typeof (x as SavedPaymentRef).reference === 'string' &&
        typeof (x as SavedPaymentRef).amountFcfa === 'number' &&
        ((x as SavedPaymentRef).flow === 'order' ||
          (x as SavedPaymentRef).flow === 'reservation')
    );
  } catch {
    return [];
  }
}

function writeList(items: SavedPaymentRef[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 30)));
}

export function listDemoPaymentRefs(): SavedPaymentRef[] {
  return parseList();
}

export function saveDemoPaymentRef(entry: {
  reference: string;
  flow: PaymentFlow;
  amountFcfa: number;
}): void {
  const existing = parseList().filter((r) => r.reference !== entry.reference);
  const next: SavedPaymentRef = {
    ...entry,
    savedAt: new Date().toISOString(),
    lifecycle: 'saved',
  };
  writeList([next, ...existing]);
}

export function upsertDemoPaymentRef(
  entry: Pick<SavedPaymentRef, 'reference' | 'flow' | 'amountFcfa'> &
    Partial<Pick<SavedPaymentRef, 'lifecycle' | 'lastRedirectAt' | 'returnSeenAt'>>
): void {
  const list = parseList();
  const i = list.findIndex((r) => r.reference === entry.reference);
  const now = new Date().toISOString();
  const prev = i >= 0 ? list[i] : null;
  const merged: SavedPaymentRef = {
    reference: entry.reference,
    flow: entry.flow,
    amountFcfa: entry.amountFcfa,
    savedAt: prev?.savedAt ?? now,
    lifecycle: entry.lifecycle ?? prev?.lifecycle ?? 'saved',
    lastRedirectAt: entry.lastRedirectAt ?? prev?.lastRedirectAt,
    returnSeenAt: entry.returnSeenAt ?? prev?.returnSeenAt,
  };
  const rest = list.filter((r) => r.reference !== entry.reference);
  writeList([merged, ...rest]);
}

export function markDemoRedirect(reference: string, flow: PaymentFlow, amountFcfa: number): void {
  upsertDemoPaymentRef({
    reference,
    flow,
    amountFcfa,
    lifecycle: 'redirected',
    lastRedirectAt: new Date().toISOString(),
  });
}

export function markDemoReturnSuccess(
  reference: string,
  opts?: { flow?: PaymentFlow; amountFcfa?: number }
): void {
  const ref = reference.trim();
  const list = parseList();
  const row = list.find((r) => r.reference.toUpperCase() === ref.toUpperCase());
  const now = new Date().toISOString();
  if (!row) {
    upsertDemoPaymentRef({
      reference: ref,
      flow: opts?.flow ?? 'order',
      amountFcfa: opts?.amountFcfa ?? 0,
      lifecycle: 'return_success',
      returnSeenAt: now,
    });
    return;
  }
  upsertDemoPaymentRef({
    ...row,
    lifecycle: 'return_success',
    returnSeenAt: now,
  });
}

export function markDemoAckVendeuse(reference: string): void {
  const list = parseList();
  const row = list.find((r) => r.reference.toUpperCase() === reference.trim().toUpperCase());
  if (!row) return;
  upsertDemoPaymentRef({
    ...row,
    lifecycle: 'ack_vendeuse',
  });
}

export function markDemoReturnCancel(
  reference: string,
  opts?: { flow?: PaymentFlow; amountFcfa?: number }
): void {
  const ref = reference.trim();
  const list = parseList();
  const row = list.find((r) => r.reference.toUpperCase() === ref.toUpperCase());
  const now = new Date().toISOString();
  if (!row) {
    upsertDemoPaymentRef({
      reference: ref,
      flow: opts?.flow ?? 'order',
      amountFcfa: opts?.amountFcfa ?? 0,
      lifecycle: 'return_cancel',
      returnSeenAt: now,
    });
    return;
  }
  upsertDemoPaymentRef({
    ...row,
    lifecycle: 'return_cancel',
    returnSeenAt: now,
  });
}
