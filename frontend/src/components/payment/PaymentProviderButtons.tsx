import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import {
  buildPaymentRedirectUrl,
  buildWaveRedirectUrl,
  getOrangeMoneyPayBaseUrl,
  getWavePayBaseUrl,
  redirectToExternalPayment,
  type PaymentFlow,
} from '../../config/paymentLinks';

interface PaymentProviderButtonsProps {
  amountFcfa: number;
  flow: PaymentFlow;
  disabled?: boolean;
  /** Si fourni (ex. après checkout API), utilisé pour Wave / OM et le suivi. */
  reference?: string | null;
}

function makeReference(flow: PaymentFlow): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `WRG-${flow}-${t}-${r}`.toUpperCase();
}

const PaymentProviderButtons = ({
  amountFcfa,
  flow,
  disabled,
  reference: referenceProp,
}: PaymentProviderButtonsProps) => {
  const fallbackRef = useMemo(() => makeReference(flow), [flow]);
  const reference = (referenceProp?.trim() ? referenceProp.trim() : fallbackRef).toUpperCase();
  const [copied, setCopied] = useState(false);

  const waveBase = getWavePayBaseUrl();
  const omBase = getOrangeMoneyPayBaseUrl();

  const appendReturns = typeof window !== 'undefined';

  const waveCheckoutUrl = useMemo(
    () =>
      waveBase
        ? buildWaveRedirectUrl(
            waveBase,
            { amountFcfa, reference, flow },
            { appendReturnUrls: appendReturns }
          )
        : '',
    [waveBase, amountFcfa, reference, flow, appendReturns]
  );

  const payWave = () => {
    if (!waveBase) {
      window.alert(
        'Lien Wave non configuré. Ajoute VITE_WAVE_PAY_URL dans le fichier .env du frontend (voir .env.example).'
      );
      return;
    }
    redirectToExternalPayment(
      buildWaveRedirectUrl(
        waveBase,
        { amountFcfa, reference, flow },
        { appendReturnUrls: appendReturns }
      )
    );
  };

  const payOrange = () => {
    if (!omBase) {
      window.alert(
        'Lien Orange Money non configuré. Ajoute VITE_ORANGE_MONEY_PAY_URL dans le fichier .env du frontend (voir .env.example).'
      );
      return;
    }
    redirectToExternalPayment(
      buildPaymentRedirectUrl(
        omBase,
        { amountFcfa, reference, flow },
        { appendReturnUrls: appendReturns }
      )
    );
  };

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie la référence :', reference);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
        <p className="text-center text-[11px] text-neutral-500">
          Référence (identique sur ton reçu et la page Suivi)&nbsp;:
        </p>
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-3 py-1.5">
          <span className="font-mono text-xs text-neutral-200">{reference}</span>
          <button
            type="button"
            onClick={copyRef}
            className="rounded p-1 text-neutral-400 hover:bg-white/10 hover:text-white"
            aria-label="Copier la référence"
          >
            {copied ? (
              <Check className="h-4 w-4 text-status-green" strokeWidth={2} />
            ) : (
              <Copy className="h-4 w-4" strokeWidth={2} />
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-[10px] text-neutral-600">
        Les liens peuvent inclure des URLs de retour (
        <span className="font-mono text-neutral-500">return_url</span> /{' '}
        <span className="font-mono text-neutral-500">cancel_url</span>) selon ton intégration Wave /
        Orange Money.
      </p>

      {waveBase && waveCheckoutUrl && (
        <div className="rounded-xl border border-[#1dc8cd]/35 bg-[#1dc8cd]/[0.07] p-4 text-left text-sm leading-relaxed text-neutral-200">
          <p className="mb-2">
            Veuillez payer <span className="font-semibold text-white">Warignan Shop</span> avec Wave
            en cliquant sur ce lien&nbsp;:
          </p>
          <a
            href={waveCheckoutUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block break-all font-medium text-[#1dc8cd] underline decoration-[#1dc8cd]/50 underline-offset-2 hover:brightness-110"
          >
            {waveCheckoutUrl}
          </a>
          <p className="mt-3 text-xs text-neutral-500">
            Ajoutez cet expéditeur à vos contacts pour rendre le lien cliquable (ex.&nbsp;WhatsApp).
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled || amountFcfa <= 0}
          onClick={payWave}
          aria-label="Payer avec Wave"
          className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl bg-[#1dc8cd] px-4 py-4 shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img
            src="/images/wave_logo.avif"
            alt=""
            width={140}
            height={40}
            className="h-10 w-auto max-w-[min(100%,9rem)] object-contain object-center"
            decoding="async"
          />
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#003d40]">
            Payer
          </span>
        </button>
        <button
          type="button"
          disabled={disabled || amountFcfa <= 0}
          onClick={payOrange}
          aria-label="Payer avec Orange Money"
          className="flex min-h-[5.5rem] flex-col items-center justify-center gap-2 rounded-xl bg-white px-4 py-4 shadow-lg ring-1 ring-[#ff7900]/40 transition hover:brightness-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <img
            src="/images/Orange-Money-logo.png"
            alt=""
            width={160}
            height={48}
            className="h-11 w-auto max-w-[min(100%,10rem)] object-contain object-center"
            decoding="async"
          />
          <span className="text-[11px] font-bold uppercase tracking-wide text-[#ff7900]">
            Payer
          </span>
        </button>
      </div>
      {(!waveBase || !omBase) && (
        <p className="text-center text-xs text-amber-500/90">
          {!waveBase && !omBase
            ? 'Configure au moins une URL dans .env pour activer un moyen de paiement.'
            : !waveBase
              ? 'Wave : ajoute VITE_WAVE_PAY_URL pour activer ce bouton.'
              : 'Orange Money : ajoute VITE_ORANGE_MONEY_PAY_URL pour activer ce bouton.'}
        </p>
      )}
    </div>
  );
};

export default PaymentProviderButtons;
