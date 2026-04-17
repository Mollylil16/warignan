/**
 * URLs de paiement Wave / Orange Money (page marchande, deep link ou passerelle).
 * Renseigne-les dans frontend/.env (voir .env.example).
 */

export type PaymentFlow = 'reservation' | 'order';

function readEnv(key: string): string {
  const raw = (import.meta.env as Record<string, string | undefined>)[key];
  return typeof raw === 'string' ? raw.trim() : '';
}

export function getWavePayBaseUrl(): string {
  return readEnv('VITE_WAVE_PAY_URL');
}

export function getOrangeMoneyPayBaseUrl(): string {
  return readEnv('VITE_ORANGE_MONEY_PAY_URL');
}

/**
 * Ajoute montant + référence + type de flux en query string.
 * Si ton lien Wave/OM n’accepte pas ces paramètres, configure une URL fixe et trace la ref autrement (backend).
 */
export function getAppOrigin(): string {
  if (typeof window === 'undefined') return '';
  return window.location.origin;
}

function clientReturnUrl(
  status: 'success' | 'cancel',
  flow: PaymentFlow,
  reference: string
): string {
  const base = getAppOrigin();
  const q = new URLSearchParams({
    status,
    flow,
    ref: reference,
  });
  return `${base}/paiement/retour?${q.toString()}`;
}

export function buildPaymentRedirectUrl(
  baseUrl: string,
  params: {
    amountFcfa: number;
    reference: string;
    flow: PaymentFlow;
  },
  options?: { appendReturnUrls?: boolean }
): string {
  if (!baseUrl) return '';

  const withReturns =
    Boolean(options?.appendReturnUrls) && typeof window !== 'undefined';

  try {
    const u = new URL(baseUrl);
    u.searchParams.set('amount', String(params.amountFcfa));
    u.searchParams.set('ref', params.reference);
    u.searchParams.set('flow', params.flow);
    if (withReturns) {
      u.searchParams.set('return_url', clientReturnUrl('success', params.flow, params.reference));
      u.searchParams.set('cancel_url', clientReturnUrl('cancel', params.flow, params.reference));
    }
    return u.toString();
  } catch {
    const sep = baseUrl.includes('?') ? '&' : '?';
    const q = new URLSearchParams({
      amount: String(params.amountFcfa),
      ref: params.reference,
      flow: params.flow,
    });
    if (withReturns) {
      q.set('return_url', clientReturnUrl('success', params.flow, params.reference));
      q.set('cancel_url', clientReturnUrl('cancel', params.flow, params.reference));
    }
    return `${baseUrl}${sep}${q.toString()}`;
  }
}

/**
 * Lien Wave : les pages marchandes `pay.wave.com/m/...` sont fixes — n’y ajoute pas de query
 * (risque de casser la page Wave). Référence + montant restent affichés à côté pour le client.
 */
export function buildWaveRedirectUrl(
  baseUrl: string,
  params: {
    amountFcfa: number;
    reference: string;
    flow: PaymentFlow;
  },
  options?: { appendReturnUrls?: boolean }
): string {
  const trimmed = baseUrl.trim();
  if (!trimmed) return '';
  try {
    const u = new URL(trimmed);
    if (u.hostname === 'pay.wave.com' && u.pathname.includes('/m/')) {
      return trimmed;
    }
  } catch {
    // URL non absolue : fallback comme lien générique avec paramètres
  }
  return buildPaymentRedirectUrl(trimmed, params, options);
}

export function redirectToExternalPayment(url: string): void {
  if (!url) return;
  window.location.assign(url);
}
