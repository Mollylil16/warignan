import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';

export type GeniusPayCreatePaymentArgs = {
  amount: number;
  description: string;
  customer?: { name?: string; email?: string; phone?: string; country?: string };
  /** Données personnalisées, renvoyées dans le webhook. */
  metadata?: Record<string, unknown>;
  success_url?: string;
  error_url?: string;
};

export type GeniusPayCreatePaymentResult = {
  id: number;
  reference: string;
  amount: number;
  status: string;
  checkout_url?: string;
  payment_url?: string;
  gateway?: string;
  environment?: string;
  expires_at?: string;
};

export type GeniusPayPaymentRow = {
  id: number;
  reference: string;
  amount: number;
  currency?: string;
  status: string;
  payment_method?: string;
  provider?: string;
  created_at?: string;
  metadata?: Record<string, unknown>;
};

export async function geniusPayCreatePayment(
  args: GeniusPayCreatePaymentArgs
): Promise<GeniusPayCreatePaymentResult> {
  const key = env.GENIUSPAY_API_KEY.trim();
  const secret = env.GENIUSPAY_API_SECRET.trim();
  if (!key || !secret) {
    throw new HttpError(
      503,
      "GeniusPay non configuré : renseignez GENIUSPAY_API_KEY et GENIUSPAY_API_SECRET."
    );
  }

  const base = env.GENIUSPAY_API_BASE_URL.replace(/\/+$/, '');
  const url = `${base}/payments`;

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15_000);
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': key,
      'X-API-Secret': secret,
    },
    body: JSON.stringify(args),
    signal: ctrl.signal,
    // Important: if the endpoint is misconfigured, we may be redirected to the marketing site.
    // We want to surface the redirect explicitly instead of silently following it and parsing HTML.
    redirect: 'manual',
  });
  clearTimeout(timeout);

  if (res.status >= 300 && res.status < 400) {
    const loc = res.headers.get('location');
    throw new HttpError(
      502,
      `GeniusPay: redirection HTTP ${res.status}${loc ? ` vers ${loc}` : ''} (base URL probable incorrecte)`
    );
  }

  const contentType = res.headers.get('content-type') ?? '';
  let json: any = null;
  if (contentType.includes('application/json')) {
    try {
      json = await res.json();
    } catch {
      json = null;
    }
  }

  if (!res.ok || !json?.success || !json?.data) {
    const msg =
      json?.message ||
      json?.error ||
      (contentType && !contentType.includes('application/json')
        ? `GeniusPay: HTTP ${res.status} (réponse non-JSON: ${contentType || 'content-type absent'})`
        : `GeniusPay: HTTP ${res.status}`);
    throw new HttpError(502, typeof msg === 'string' ? msg : 'GeniusPay: erreur API');
  }

  return json.data as GeniusPayCreatePaymentResult;
}

export async function geniusPayListPayments(args: {
  status?: 'pending' | 'completed' | 'failed';
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
  per_page?: number;
}): Promise<GeniusPayPaymentRow[]> {
  const key = env.GENIUSPAY_API_KEY.trim();
  const secret = env.GENIUSPAY_API_SECRET.trim();
  if (!key || !secret) {
    throw new HttpError(
      503,
      "GeniusPay non configuré : renseignez GENIUSPAY_API_KEY et GENIUSPAY_API_SECRET."
    );
  }
  const base = env.GENIUSPAY_API_BASE_URL.replace(/\/+$/, '');
  const url = new URL(`${base}/payments`);
  if (args.status) url.searchParams.set('status', args.status);
  if (args.from) url.searchParams.set('from', args.from);
  if (args.to) url.searchParams.set('to', args.to);
  url.searchParams.set('per_page', String(Math.min(100, Math.max(1, args.per_page ?? 50))));

  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 15_000);
  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': key,
      'X-API-Secret': secret,
    },
    signal: ctrl.signal,
  });
  clearTimeout(timeout);

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // ignore
  }
  if (!res.ok || !json?.success || !json?.data) {
    const msg = json?.message || json?.error || `GeniusPay: HTTP ${res.status}`;
    throw new HttpError(502, typeof msg === 'string' ? msg : 'GeniusPay: erreur API');
  }
  const list = Array.isArray(json.data) ? json.data : json.data?.data ?? [];
  return (Array.isArray(list) ? list : []) as GeniusPayPaymentRow[];
}

