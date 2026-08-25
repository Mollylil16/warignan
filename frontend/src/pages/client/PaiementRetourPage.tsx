import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import type { PaymentFlow } from '../../config/paymentLinks';
import { formatPrice } from '../../utils/formatPrice';

type VerifyStatus = 'checking' | 'confirmed' | 'pending' | 'failed' | 'error';

/**
 * Atterrissage après redirection GeniusPay / Wave / Orange Money.
 * Quand status=success, lance automatiquement verify-single en polling
 * pour confirmer le paiement sans dépendre du webhook.
 */
const PaiementRetourPage = () => {
  const [params] = useSearchParams();

  const status = params.get('status');
  const flow = (params.get('flow') as PaymentFlow | null) ?? 'order';
  const ref = params.get('ref') ?? '';

  const safeFlow: PaymentFlow = flow === 'reservation' ? 'reservation' : 'order';

  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>(
    status === 'success' && ref ? 'checking' : 'pending'
  );
  const [paidFcfa, setPaidFcfa] = useState<number | null>(null);
  const attemptsRef = useRef(0);
  const maxAttempts = 8; // 8 tentatives × 5s = 40s max
  const intervalMs = 5000;

  const verifySingle = useCallback(async () => {
    if (!ref) return;
    try {
      const { data } = await api.post<{
        status: string;
        confirmed: boolean;
        paidFcfa?: number;
      }>('/payments/geniuspay/verify-single', { reference: ref, flow: safeFlow });

      if (data.confirmed) {
        setVerifyStatus('confirmed');
        setPaidFcfa(data.paidFcfa ?? null);
        return true; // stop polling
      }
      if (data.status === 'failed') {
        setVerifyStatus('failed');
        return true; // stop polling
      }
      return false; // continue polling
    } catch {
      return false;
    }
  }, [ref, safeFlow]);

  useEffect(() => {
    if (status !== 'success' || !ref) return;

    let timer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      attemptsRef.current += 1;
      const done = await verifySingle();
      if (done || cancelled || attemptsRef.current >= maxAttempts) {
        if (!done && !cancelled) {
          setVerifyStatus('pending'); // timeout, le paiement sera confirmé par le cron
        }
        return;
      }
      timer = setTimeout(() => void tick(), intervalMs);
    };

    // Première vérification après 2s (laisser le temps au webhook)
    timer = setTimeout(() => void tick(), 2000);

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [status, ref, verifySingle]);

  const title = useMemo(() => {
    if (verifyStatus === 'confirmed') return '✅ Paiement confirmé';
    if (verifyStatus === 'failed') return '❌ Paiement échoué';
    if (verifyStatus === 'checking') return 'Vérification en cours…';
    if (status === 'success') return 'Retour de paiement';
    if (status === 'cancel') return 'Paiement interrompu';
    return 'Paiement';
  }, [status, verifyStatus]);

  return (
    <main className="mx-auto max-w-lg px-4 py-12 text-center text-white sm:py-16">
      <h1
        className="mb-3 text-xl font-bold sm:text-2xl"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h1>
      {ref && <p className="mb-2 font-mono text-sm text-tiktok-cyan">{ref}</p>}

      {/* Statut de vérification */}
      {status === 'success' && (
        <div className="mb-6">
          {verifyStatus === 'checking' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-6">
              <Loader2 className="h-8 w-8 animate-spin text-tiktok-cyan" />
              <p className="text-sm text-neutral-300">
                Vérification du paiement auprès de GeniusPay…
              </p>
              <p className="text-[11px] text-neutral-500">
                Tentative {attemptsRef.current}/{maxAttempts}
              </p>
            </div>
          )}
          {verifyStatus === 'confirmed' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
              <p className="text-sm font-semibold text-green-300">
                Paiement confirmé avec succès !
              </p>
              {paidFcfa != null && (
                <p className="text-lg font-bold text-white">{formatPrice(paidFcfa)}</p>
              )}
              <p className="text-xs text-neutral-400">
                Ta commande va être traitée par l'équipe Warignan.
              </p>
            </div>
          )}
          {verifyStatus === 'failed' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-6">
              <XCircle className="h-10 w-10 text-red-400" />
              <p className="text-sm font-semibold text-red-300">
                Le paiement a échoué ou a été annulé.
              </p>
              <p className="text-xs text-neutral-400">
                Tu peux réessayer depuis la page de paiement.
              </p>
            </div>
          )}
          {verifyStatus === 'pending' && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-6">
              <Clock className="h-10 w-10 text-yellow-400" />
              <p className="text-sm font-semibold text-yellow-300">
                Paiement en cours de traitement
              </p>
              <p className="text-xs text-neutral-400">
                L'opérateur confirme ton paiement. L'équipe Warignan le verra
                automatiquement dans quelques minutes. Tu peux vérifier sur la page Suivi.
              </p>
            </div>
          )}
        </div>
      )}

      {status === 'cancel' && (
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Tu peux reprendre le panier et relancer le paiement quand tu veux.
        </p>
      )}
      {status === 'error' && (
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Une erreur est survenue lors du paiement. Tu peux réessayer.
        </p>
      )}
      {!status && (
        <p className="mb-6 text-sm text-neutral-500">
          Paramètres de retour incomplets. Utilise les liens depuis la page de paiement.
        </p>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/suivi"
          className="inline-block rounded-lg bg-tiktok-pink px-6 py-3 text-sm font-bold text-white"
        >
          Voir le suivi
        </Link>
        <Link
          to={safeFlow === 'reservation' ? '/paiement/reservation' : '/paiement/commande'}
          className="inline-block rounded-lg border border-white/20 px-6 py-3 text-sm font-semibold text-neutral-300 hover:bg-white/5"
        >
          Retour au paiement
        </Link>
        <Link to="/fouille" className="text-sm text-tiktok-cyan underline-offset-2 hover:underline">
          Continuer la fouille
        </Link>
      </div>
    </main>
  );
};

export default PaiementRetourPage;
