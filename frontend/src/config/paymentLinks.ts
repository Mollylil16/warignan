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
export function buildPaymentRedirectUrl(
  baseUrl: string,
  params: {
    amountFcfa: number;
    reference: string;
    flow: PaymentFlow;
  }
): string {
  if (!baseUrl) return '';

  try {
    const u = new URL(baseUrl);
    u.searchParams.set('amount', String(params.amountFcfa));
    u.searchParams.set('ref', params.reference);
    u.searchParams.set('flow', params.flow);
    return u.toString();
  } catch {
    const sep = baseUrl.includes('?') ? '&' : '?';
    const q = new URLSearchParams({
      amount: String(params.amountFcfa),
      ref: params.reference,
      flow: params.flow,
    });
    return `${baseUrl}${sep}${q.toString()}`;
  }
}

export function redirectToExternalPayment(url: string): void {
  if (!url) return;
  window.location.assign(url);
}
