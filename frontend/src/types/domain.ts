/** Types métier partagés (alignés Prisma / API). */

export type OrderStep = 'preparation' | 'emballage' | 'expediee' | 'livree';

export type ReservationWorkflow =
  | 'awaiting_deposit'
  | 'awaiting_validation'
  | 'validated'
  | 'cancelled';

export type DepositStatus = 'pending' | 'paid' | 'failed';

export type MediaGallerySlot = 'robes' | 'crops' | 'live' | 'banners' | 'uncategorized';

export type PromotionTypeApi = 'percent' | 'fixed';
