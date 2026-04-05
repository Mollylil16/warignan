import { useMemo } from 'react';
import {
  buildPaymentRedirectUrl,
  getOrangeMoneyPayBaseUrl,
  getWavePayBaseUrl,
  redirectToExternalPayment,
  type PaymentFlow,
} from '../../config/paymentLinks';

interface PaymentProviderButtonsProps {
  amountFcfa: number;
  flow: PaymentFlow;
  disabled?: boolean;
}

function makeReference(flow: PaymentFlow): string {
  const t = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 8);
  return `WRG-${flow}-${t}-${r}`.toUpperCase();
}

/**
 * Redirection navigateur vers les URLs marchandes Wave / Orange Money (.env).
 */
const PaymentProviderButtons = ({
  amountFcfa,
  flow,
  disabled,
}: PaymentProviderButtonsProps) => {
  const reference = useMemo(() => makeReference(flow), [flow, amountFcfa]);

  const waveBase = getWavePayBaseUrl();
  const omBase = getOrangeMoneyPayBaseUrl();

  const payWave = () => {
    if (!waveBase) {
      window.alert(
        'Lien Wave non configuré. Ajoute VITE_WAVE_PAY_URL dans le fichier .env du frontend (voir .env.example).'
      );
      return;
    }
    redirectToExternalPayment(
      buildPaymentRedirectUrl(waveBase, { amountFcfa, reference, flow })
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
      buildPaymentRedirectUrl(omBase, { amountFcfa, reference, flow })
    );
  };

  return (
    <div className="space-y-3">
      <p className="text-center text-[11px] text-neutral-500">
        Référence de paiement (à conserver)&nbsp;:{' '}
        <span className="font-mono text-neutral-400">{reference}</span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={disabled || amountFcfa <= 0}
          onClick={payWave}
          className="rounded-xl bg-[#1dc8cd] py-4 text-sm font-bold uppercase tracking-wide text-[#003d40] shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Payer avec Wave
        </button>
        <button
          type="button"
          disabled={disabled || amountFcfa <= 0}
          onClick={payOrange}
          className="rounded-xl bg-[#ff7900] py-4 text-sm font-bold uppercase tracking-wide text-white shadow-lg transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Payer avec Orange Money
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
