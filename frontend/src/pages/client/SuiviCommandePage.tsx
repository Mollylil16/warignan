import { type FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search } from 'lucide-react';
import {
  type MockOrder,
  type MockReservation,
  type OrderStep,
  type ReservationWorkflow,
} from '../../data/vendeuseMock';
import { useClientTracking } from '../../hooks/useClientTracking';
import { listDemoPaymentRefs } from '../../utils/demoPaymentRefs';
import { formatPrice } from '../../utils/formatPrice';

const orderStepClientLabel: Record<OrderStep, string> = {
  preparation: 'Préparation de ta commande',
  emballage: 'Emballage',
  expediee: 'Expédiée / en route',
  livree: 'Livrée',
};

const reservationWorkflowLabel: Record<ReservationWorkflow, string> = {
  awaiting_deposit: 'En attente de l’acompte',
  awaiting_validation: 'Acompte reçu — validation vendeuse',
  validated: 'Réservation validée',
  cancelled: 'Annulée',
};

function normalizeRef(s: string) {
  return s.trim().toUpperCase();
}

const SuiviCommandePage = () => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState<string | null>(null);

  const { result, refresh, lastSyncedAt, isSyncing } = useClientTracking(submitted);

  const recentRefs = listDemoPaymentRefs()
    .slice(0, 6)
    .map((r) => r.reference);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(query);
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-8 text-white sm:max-w-xl sm:py-10">
      <h1
        className="mb-2 text-center text-xl font-bold sm:text-2xl"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Suivi commande / réservation
      </h1>
      <p className="mb-4 text-center text-sm text-neutral-400">
        Une fois le backend en ligne, cette page interrogera l’API en temps réel (webhooks Wave / OM +
        statuts vendeuse). Pour l’instant : données de démo + suivi local sur ton appareil.
      </p>

      <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => refresh()}
          disabled={!submitted || isSyncing}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#111] px-4 py-2 text-xs font-semibold text-neutral-300 transition hover:border-tiktok-cyan/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <RefreshCw
            className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            strokeWidth={2}
            aria-hidden
          />
          Synchroniser
        </button>
        {lastSyncedAt && (
          <span className="text-[10px] text-neutral-600">
            Dernière synchro :{' '}
            {lastSyncedAt.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mb-6">
        <label htmlFor="ref" className="mb-2 block text-xs font-semibold uppercase text-neutral-500">
          Référence
        </label>
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500"
              strokeWidth={2}
              aria-hidden
            />
            <input
              id="ref"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="WRG-…"
              className="w-full rounded-lg border border-white/10 bg-[#111] py-3 pl-10 pr-3 font-mono text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-cyan/50 focus:outline-none focus:ring-1 focus:ring-tiktok-cyan/40"
              autoComplete="off"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-tiktok-pink px-4 py-3 text-sm font-bold text-white hover:brightness-110"
          >
            Suivre
          </button>
        </div>
      </form>

      {recentRefs.length > 0 && (
        <div className="mb-8">
          <p className="mb-2 text-[10px] font-semibold uppercase text-neutral-600">
            Récentes sur cet appareil
          </p>
          <div className="flex flex-wrap gap-2">
            {recentRefs.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setQuery(r);
                  setSubmitted(r);
                }}
                className="rounded-full border border-white/10 bg-[#141414] px-3 py-1 font-mono text-[10px] text-tiktok-cyan hover:border-tiktok-cyan/40"
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="mb-6 text-center text-[11px] text-neutral-600">
        Essais serveur mock :{' '}
        <button
          type="button"
          className="font-mono text-neutral-400 underline-offset-2 hover:underline"
          onClick={() => {
            setQuery('WRG-CMD-001');
            setSubmitted('WRG-CMD-001');
          }}
        >
          WRG-CMD-001
        </button>
        {' · '}
        <button
          type="button"
          className="font-mono text-neutral-400 underline-offset-2 hover:underline"
          onClick={() => {
            setQuery('WRG-RES-A1B2');
            setSubmitted('WRG-RES-A1B2');
          }}
        >
          WRG-RES-A1B2
        </button>
      </p>

      {!result && (
        <p className="rounded-lg border border-white/10 bg-[#111] p-4 text-sm text-neutral-400">
          Saisis une référence pour afficher le statut.
        </p>
      )}

      {result?.kind === 'empty' && (
        <p className="rounded-lg border border-white/10 bg-[#111] p-4 text-sm text-neutral-400">
          Référence vide.
        </p>
      )}

      {result?.kind === 'not_found' && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200/90">
          Aucun dossier pour «&nbsp;{normalizeRef(result.ref)}&nbsp;». Vérifie la saisie, enregistre la
          référence depuis le paiement, ou attends la synchro après un retour Wave / OM.
        </div>
      )}

      {result?.kind === 'local_payment' && (
        <article className="rounded-xl border border-tiktok-cyan/30 bg-[#111] p-5">
          <p className="mb-1 font-mono text-sm text-tiktok-cyan">{result.saved.reference}</p>
          <p className="mb-2 text-lg font-bold text-white">Paiement (données locales)</p>
          <p className="mb-3 text-sm text-neutral-400">
            Flux :{' '}
            <strong className="text-neutral-200">
              {result.saved.flow === 'order' ? 'Commande' : 'Réservation (acompte)'}
            </strong>
            {result.saved.amountFcfa > 0 && (
              <>
                {' '}
                — montant :{' '}
                <strong className="text-white">{formatPrice(result.saved.amountFcfa)}</strong>
              </>
            )}
          </p>
          <p className="mb-3 rounded-lg border border-white/10 bg-black/30 p-3 text-sm leading-relaxed text-neutral-300">
            {result.hint}
          </p>
          <p className="text-xs text-neutral-600">
            Cycle :{' '}
            <span className="font-mono text-neutral-500">{result.saved.lifecycle ?? 'saved'}</span>
            {result.saved.lastRedirectAt && (
              <>
                {' '}
                · Redirection :{' '}
                {new Date(result.saved.lastRedirectAt).toLocaleString('fr-FR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </>
            )}
            {result.saved.returnSeenAt && (
              <>
                {' '}
                · Retour site :{' '}
                {new Date(result.saved.returnSeenAt).toLocaleString('fr-FR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </>
            )}
          </p>
        </article>
      )}

      {result?.kind === 'order' && <OrderTrackingCard order={result.order} />}
      {result?.kind === 'reservation' && (
        <ReservationTrackingCard reservation={result.reservation} />
      )}

      <p className="mt-10 text-center text-xs text-neutral-600">
        <Link to="/fouille" className="text-tiktok-cyan underline-offset-2 hover:underline">
          Retour à la fouille
        </Link>
      </p>
    </main>
  );
};

function OrderTrackingCard({ order }: { order: MockOrder }) {
  const steps: OrderStep[] = ['preparation', 'emballage', 'expediee', 'livree'];
  const idx = steps.indexOf(order.step);

  return (
    <article className="rounded-xl border border-white/10 bg-[#111] p-5">
      <p className="mb-1 font-mono text-sm text-tiktok-cyan">{order.reference}</p>
      <p className="text-lg font-bold text-white">Commande</p>
      <p className="mb-4 text-sm text-neutral-500">{order.city}</p>
      <p className="mb-2 text-sm text-neutral-400">{order.itemsSummary}</p>
      <p className="mb-6 text-xl font-bold text-tiktok-pink">{formatPrice(order.totalFcfa)}</p>

      <p className="mb-3 text-xs font-semibold uppercase text-neutral-500">Étapes</p>
      <ol className="space-y-3">
        {steps.map((s, i) => {
          const done = i <= idx;
          return (
            <li key={s} className="flex gap-3">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  done ? 'bg-tiktok-pink text-white' : 'border border-white/20 text-neutral-600'
                }`}
              >
                {i + 1}
              </span>
              <div>
                <p className={done ? 'font-medium text-white' : 'text-neutral-600'}>
                  {orderStepClientLabel[s]}
                </p>
                {s === order.step && (
                  <p className="text-xs text-tiktok-cyan">Étape en cours</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-neutral-600">
        Payé le{' '}
        {new Date(order.paidAt).toLocaleString('fr-FR', {
          dateStyle: 'short',
          timeStyle: 'short',
        })}
      </p>
    </article>
  );
}

function ReservationTrackingCard({ reservation }: { reservation: MockReservation }) {
  return (
    <article className="rounded-xl border border-white/10 bg-[#111] p-5">
      <p className="mb-1 font-mono text-sm text-reserve-purple">{reservation.reference}</p>
      <p className="text-lg font-bold text-white">Réservation</p>
      <p className="mb-4 text-sm text-neutral-500">{reservation.productsSummary}</p>
      <p className="mb-2 text-sm text-neutral-400">
        Acompte :{' '}
        <span className="font-semibold text-reserve-purple">
          {formatPrice(reservation.depositFcfa)}
        </span>{' '}
        — statut :{' '}
        <span className="text-white">
          {reservation.depositStatus === 'paid'
            ? 'Payé'
            : reservation.depositStatus === 'pending'
              ? 'En attente'
              : 'Échec'}
        </span>
      </p>
      <p className="mb-6 text-xl font-bold text-white">{formatPrice(reservation.totalFcfa)} total</p>
      <p className="rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-neutral-300">
        {reservationWorkflowLabel[reservation.workflow]}
      </p>
    </article>
  );
}

export default SuiviCommandePage;
