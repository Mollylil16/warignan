/** Part du sous-total « Réserver » payée en ligne pour enregistrer la demande. */
export const ACOMPTE_RESERVATION_RATIO = 0.3;

export function reservationDepositFcfa(reserveSubtotal: number): number {
  return Math.ceil(reserveSubtotal * ACOMPTE_RESERVATION_RATIO);
}
