import {
  mockOrders,
  mockReservations,
  type MockOrder,
  type MockReservation,
} from '../data/vendeuseMock';
import {
  listDemoPaymentRefs,
  type SavedPaymentRef,
} from '../utils/demoPaymentRefs';

export type ClientTrackingResult =
  | { kind: 'empty' }
  | { kind: 'not_found'; ref: string }
  | { kind: 'order'; order: MockOrder }
  | { kind: 'reservation'; reservation: MockReservation }
  | { kind: 'local_payment'; saved: SavedPaymentRef; hint: string };

function normalizeRef(s: string) {
  return s.trim().toUpperCase();
}

function localPaymentHint(saved: SavedPaymentRef): string {
  const ageMs = Date.now() - new Date(saved.savedAt).getTime();
  const minutes = ageMs / 60_000;
  switch (saved.lifecycle) {
    case 'redirected':
      return 'Tu as été redirigé vers Wave ou Orange Money. Dès que le paiement est validé, Warignan mettra à jour ton dossier (webhook + API à brancher).';
    case 'return_success':
      return 'Retour de paiement reçu sur le site. Prochaine étape : confirmation côté Warignan puis lien avec ta commande ou réservation.';
    case 'return_cancel':
      return 'Paiement interrompu ou annulé. Tu peux relancer depuis le panier si besoin.';
    case 'ack_vendeuse':
      return 'Paiement pris en compte par l’équipe — suivi détaillé disponible dès que le backend synchronise les statuts.';
    case 'saved':
    default:
      if (minutes > 2) {
        return 'Référence enregistrée. Si tu as déjà payé, la validation peut prendre quelques minutes sans rechargement de page.';
      }
      return 'Référence enregistrée sur cet appareil. Utilise Wave / Orange Money puis le bouton de retour ou actualise le suivi.';
  }
}

/**
 * Point d’entrée unique pour le suivi client : mock « serveur » + données locales (avant API).
 */
export function resolveClientTracking(rawRef: string): ClientTrackingResult {
  const ref = normalizeRef(rawRef);
  if (!ref) return { kind: 'empty' };

  const order = mockOrders.find((o) => o.reference.toUpperCase() === ref);
  if (order) return { kind: 'order', order };

  const res = mockReservations.find((r) => r.reference.toUpperCase() === ref);
  if (res) return { kind: 'reservation', reservation: res };

  const saved = listDemoPaymentRefs().find((r) => r.reference.toUpperCase() === ref);
  if (saved) {
    return { kind: 'local_payment', saved, hint: localPaymentHint(saved) };
  }

  return { kind: 'not_found', ref };
}
