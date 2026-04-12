/** Données fictives espace vendeuse — remplacées par l’API plus tard. */

export type DepositStatus = 'pending' | 'paid' | 'failed';
export type ReservationWorkflow = 'awaiting_deposit' | 'awaiting_validation' | 'validated' | 'cancelled';

export interface MockReservation {
  id: string;
  clientName: string;
  clientPhone: string;
  reference: string;
  productsSummary: string;
  totalFcfa: number;
  depositFcfa: number;
  depositStatus: DepositStatus;
  workflow: ReservationWorkflow;
  createdAt: string;
}

export type OrderStep = 'preparation' | 'emballage' | 'expediee' | 'livree';

export interface MockOrder {
  id: string;
  clientName: string;
  reference: string;
  itemsSummary: string;
  totalFcfa: number;
  paidAt: string;
  step: OrderStep;
  city: string;
}

export type DeliveryRunStatus = 'planned' | 'assigned' | 'out' | 'done';

export interface MockDelivery {
  id: string;
  orderRef: string;
  clientName: string;
  address: string;
  dateISO: string;
  windowLabel: string;
  courierId: string | null;
  status: DeliveryRunStatus;
}

export interface MockCourier {
  id: string;
  name: string;
  phone: string;
  zones: string[];
  active: boolean;
  note?: string;
}

/** Emplacement d’usage côté site (robes, crops, live, bannières). */
export type MediaGallerySlot = 'robes' | 'crops' | 'live' | 'banners' | 'uncategorized';

export interface MockMediaAsset {
  id: string;
  url: string;
  filename: string;
  isPrimary: boolean;
  context: string;
  gallery: MediaGallerySlot;
}

export interface MockPromotion {
  id: string;
  code: string;
  label: string;
  type: 'percent' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
}

export const mockReservations: MockReservation[] = [
  {
    id: 'r1',
    clientName: 'Aïcha K.',
    clientPhone: '+225 07 12 34 56 78',
    reference: 'WRG-RES-A1B2',
    productsSummary: 'Robe Soie Vintage ×1, Crop rose ×1',
    totalFcfa: 15000,
    depositFcfa: 4500,
    depositStatus: 'paid',
    workflow: 'awaiting_validation',
    createdAt: '2026-04-04T14:20:00',
  },
  {
    id: 'r2',
    clientName: 'Mariam D.',
    clientPhone: '+225 05 98 76 54 32',
    reference: 'WRG-RES-C3D4',
    productsSummary: 'Maxi robe fleurie ×1',
    totalFcfa: 8000,
    depositFcfa: 2400,
    depositStatus: 'pending',
    workflow: 'awaiting_deposit',
    createdAt: '2026-04-05T09:10:00',
  },
  {
    id: 'r3',
    clientName: 'Sophie L.',
    clientPhone: '+225 01 11 22 33 44',
    reference: 'WRG-RES-E5F6',
    productsSummary: 'Crop denim ×2',
    totalFcfa: 8400,
    depositFcfa: 2520,
    depositStatus: 'paid',
    workflow: 'validated',
    createdAt: '2026-04-03T18:00:00',
  },
];

export const mockOrders: MockOrder[] = [
  {
    id: 'o1',
    clientName: 'Aïcha K.',
    reference: 'WRG-CMD-001',
    itemsSummary: 'Robe cocktail satin ×1',
    totalFcfa: 11000,
    paidAt: '2026-04-04T16:00:00',
    step: 'preparation',
    city: 'Cocody',
  },
  {
    id: 'o2',
    clientName: 'Koffi M.',
    reference: 'WRG-CMD-002',
    itemsSummary: 'Crop lin ×1, Robe wrap ×1',
    totalFcfa: 12300,
    paidAt: '2026-04-05T10:30:00',
    step: 'emballage',
    city: 'Marcory',
  },
  {
    id: 'o3',
    clientName: 'Yasmine T.',
    reference: 'WRG-CMD-003',
    itemsSummary: 'Robe noire élégante ×1',
    totalFcfa: 15500,
    paidAt: '2026-04-02T11:00:00',
    step: 'expediee',
    city: 'Yopougon',
  },
];

export const mockCouriers: MockCourier[] = [
  {
    id: 'c1',
    name: 'Kouassi — Express Treichville',
    phone: '+225 07 00 11 22 33',
    zones: ['Treichville', 'Marcory', 'Zone 4'],
    active: true,
    note: 'Dispo après 15h',
  },
  {
    id: 'c2',
    name: 'Awa Livraisons',
    phone: '+225 05 44 55 66 77',
    zones: ['Cocody', 'Riviera', 'Angré'],
    active: true,
  },
  {
    id: 'c3',
    name: 'Bruno Moto',
    phone: '+225 01 88 99 00 11',
    zones: ['Yopougon', 'Adjamé', 'Abobo'],
    active: false,
  },
];

export const mockDeliveries: MockDelivery[] = [
  {
    id: 'd1',
    orderRef: 'WRG-CMD-003',
    clientName: 'Yasmine T.',
    address: 'Yopougon Sicogi, près de la pharmacie',
    dateISO: '2026-04-06',
    windowLabel: '14h – 18h',
    courierId: 'c3',
    status: 'assigned',
  },
  {
    id: 'd2',
    orderRef: 'WRG-CMD-002',
    clientName: 'Koffi M.',
    address: 'Marcory résidentiel, villa 12',
    dateISO: '2026-04-06',
    windowLabel: '10h – 12h',
    courierId: 'c1',
    status: 'assigned',
  },
  {
    id: 'd3',
    orderRef: 'WRG-CMD-OLD',
    clientName: 'Client test',
    address: 'Cocody Angré 7e tranche',
    dateISO: '2026-04-05',
    windowLabel: 'Terminée',
    courierId: 'c2',
    status: 'done',
  },
];

export const mockMediaAssets: MockMediaAsset[] = [
  {
    id: 'm1',
    url: '/images/robe.webp',
    filename: 'robe.webp',
    isPrimary: true,
    context: 'Catalogue — Robes',
    gallery: 'robes',
  },
  {
    id: 'm2',
    url: '/images/robe3.webp',
    filename: 'robe3.webp',
    isPrimary: false,
    context: 'Catalogue — Robes',
    gallery: 'robes',
  },
  {
    id: 'm3',
    url: '/images/croc4.webp',
    filename: 'croc4.webp',
    isPrimary: false,
    context: 'Catalogue — Crops',
    gallery: 'crops',
  },
  {
    id: 'm4',
    url: '/images/crocs2.webp',
    filename: 'crocs2.webp',
    isPrimary: false,
    context: 'Catalogue — Crops',
    gallery: 'crops',
  },
];

export const mockPromotions: MockPromotion[] = [
  {
    id: 'p1',
    code: 'WARI10',
    label: '10% sur les crops',
    type: 'percent',
    value: 10,
    startDate: '2026-04-01',
    endDate: '2026-04-30',
    active: true,
  },
  {
    id: 'p2',
    code: 'SHIP500',
    label: '500 FCFA sur la livraison',
    type: 'fixed',
    value: 500,
    startDate: '2026-04-05',
    endDate: '2026-04-12',
    active: true,
  },
  {
    id: 'p3',
    code: 'OLD20',
    label: 'Ancienne promo',
    type: 'percent',
    value: 20,
    startDate: '2026-01-01',
    endDate: '2026-02-28',
    active: false,
  },
];
