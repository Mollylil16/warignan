import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { PaymentFlow } from '../../config/paymentLinks';

/**
 * Atterrissage après redirection Wave / Orange Money (return_url / cancel_url).
 */
const PaiementRetourPage = () => {
  const [params] = useSearchParams();

  const status = params.get('status');
  const flow = (params.get('flow') as PaymentFlow | null) ?? 'order';
  const ref = params.get('ref') ?? '';

  const safeFlow: PaymentFlow = flow === 'reservation' ? 'reservation' : 'order';

  const title = useMemo(() => {
    if (status === 'success') return 'Retour de paiement';
    if (status === 'cancel') return 'Paiement interrompu';
    return 'Paiement';
  }, [status]);

  return (
    <main className="mx-auto max-w-lg px-4 py-12 text-center text-white sm:py-16">
      <h1
        className="mb-3 text-xl font-bold sm:text-2xl"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        {title}
      </h1>
      {ref && <p className="mb-2 font-mono text-sm text-tiktok-cyan">{ref}</p>}
      {status === 'success' && (
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Dès que le paiement est confirmé par l’opérateur, l’équipe Warignan met à jour ta commande ou
          ta réservation. Utilise cette référence sur la page Suivi pour voir l’état en temps réel.
        </p>
      )}
      {status === 'cancel' && (
        <p className="mb-6 text-sm leading-relaxed text-neutral-400">
          Tu peux reprendre le panier et relancer le paiement quand tu veux.
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
