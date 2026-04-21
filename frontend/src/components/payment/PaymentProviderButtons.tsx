import { useMemo, useState } from 'react';
import { Check, Copy, ExternalLink } from 'lucide-react';
import { api, apiErrorMessage } from '../../services/api';
import type { PaymentFlow } from '../../config/paymentLinks';
import { formatPrice } from '../../utils/formatPrice';

interface PaymentProviderButtonsProps {
  amountFcfa: number;
  flow: PaymentFlow;
  disabled?: boolean;
  /** Si fourni (ex. après checkout API), utilisé pour Wave / OM et le suivi. */
  reference?: string | null;
  /** Autorise un paiement partiel (commande). */
  allowPartial?: boolean;
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
  allowPartial,
}: PaymentProviderButtonsProps) => {
  const fallbackRef = useMemo(() => makeReference(flow), [flow]);
  const reference = (referenceProp?.trim() ? referenceProp.trim() : fallbackRef).toUpperCase();
  const [copied, setCopied] = useState(false);
  const [payAmount, setPayAmount] = useState(amountFcfa);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [paidConfirmed, setPaidConfirmed] = useState<number | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [summaryBusy, setSummaryBusy] = useState(false);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copie la référence :', reference);
    }
  };

  const payWithGeniusPay = async () => {
    setErr(null);
    setBusy(true);
    try {
      const successUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/paiement/retour?status=success&ref=${encodeURIComponent(reference)}`
          : undefined;
      const errorUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/paiement/retour?status=error&ref=${encodeURIComponent(reference)}`
          : undefined;
      const { data } = await api.post<{ checkoutUrl: string }>('/payments/geniuspay/checkout', {
        reference,
        flow,
        amountFcfa: Math.max(1, Math.round(payAmount)),
        successUrl,
        errorUrl,
      });
      if (!data?.checkoutUrl) throw new Error('checkoutUrl manquant');
      window.location.href = data.checkoutUrl;
    } catch (e) {
      setErr(apiErrorMessage(e, 'Impossible de démarrer le paiement.'));
    } finally {
      setBusy(false);
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

      {!!referenceProp && (
        <div className="rounded-xl border border-white/10 bg-[#111] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Résumé paiement
            </p>
            <button
              type="button"
              disabled={summaryBusy}
              onClick={async () => {
                setErr(null);
                setSummaryBusy(true);
                try {
                  const { data } = await api.get<{
                    expectedFcfa: number;
                    paidConfirmedFcfa: number;
                    remainingFcfa: number;
                  }>('/payments/summary', { params: { reference, flow } });
                  setPaidConfirmed(data.paidConfirmedFcfa);
                  setRemaining(data.remainingFcfa);
                  if (!allowPartial) setPayAmount(data.remainingFcfa || amountFcfa);
                } catch (e) {
                  setErr(apiErrorMessage(e, 'Impossible de récupérer le résumé.'));
                } finally {
                  setSummaryBusy(false);
                }
              }}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-neutral-300 hover:bg-white/10 disabled:opacity-50"
            >
              {summaryBusy ? 'Chargement…' : 'Rafraîchir'}
            </button>
          </div>
          <div className="mt-3 grid gap-2 text-sm text-neutral-300">
            <div className="flex justify-between">
              <span className="text-neutral-500">Déjà confirmé</span>
              <span className="font-semibold text-white">
                {paidConfirmed == null ? '—' : formatPrice(paidConfirmed)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Reste à payer</span>
              <span className="font-semibold text-tiktok-pink">
                {remaining == null ? '—' : formatPrice(remaining)}
              </span>
            </div>
          </div>
          {remaining != null && remaining > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPayAmount(remaining)}
                className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white hover:bg-white/15"
              >
                Payer le reste
              </button>
              {allowPartial && (
                <button
                  type="button"
                  onClick={() => setPayAmount(Math.max(1, Math.min(payAmount, remaining)))}
                  className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-neutral-300 hover:bg-white/5"
                >
                  Montant personnalisé
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {allowPartial && (
        <div className="rounded-xl border border-white/10 bg-[#111] p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Paiement partiel
          </p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              className="h-10 flex-1 rounded-lg border border-white/10 bg-black px-3 text-sm text-white"
              placeholder="Montant à payer maintenant"
            />
            <span className="text-xs text-neutral-500">FCFA</span>
          </div>
          <p className="mt-2 text-[10px] text-neutral-600">
            Tu peux payer en plusieurs fois. Les paiements confirmés s’additionnent côté vendeuse.
          </p>
        </div>
      )}

      {err && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-200">
          {err}
        </p>
      )}

      <button
        type="button"
        disabled={disabled || busy || payAmount <= 0}
        onClick={() => void payWithGeniusPay()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-tiktok-pink px-4 py-4 text-sm font-bold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ExternalLink className="h-5 w-5" strokeWidth={2} aria-hidden />
        {busy ? 'Redirection…' : 'Payer maintenant (GeniusPay)'}
      </button>
      <p className="text-center text-[10px] text-neutral-600">
        GeniusPay propose Wave / Orange Money (et autres) sur une page de checkout sécurisée.
      </p>
    </div>
  );
};

export default PaymentProviderButtons;
