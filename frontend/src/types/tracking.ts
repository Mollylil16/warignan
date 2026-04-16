import type { OrderStep, ReservationWorkflow, DepositStatus } from './domain';

export type TrackingOrder = {
  id: string;
  reference: string;
  clientName: string;
  city: string;
  itemsSummary: string;
  subtotalFcfa: number;
  discountFcfa: number;
  promoCode: string | null;
  totalFcfa: number;
  paidAt: string | null;
  step: OrderStep;
};

export type TrackingReservation = {
  id: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  productsSummary: string;
  subtotalFcfa: number;
  discountFcfa: number;
  promoCode: string | null;
  totalFcfa: number;
  depositFcfa: number;
  depositStatus: DepositStatus;
  workflow: ReservationWorkflow;
  createdAt: string;
};

export type ApiPaymentEventRow = {
  flow: string;
  amountFcfa: number;
  provider: string | null;
  status: string;
  createdAt: string;
};

export type ClientTrackingResult =
  | { kind: 'empty' }
  | { kind: 'not_found'; ref: string }
  | { kind: 'order'; order: TrackingOrder }
  | { kind: 'reservation'; reservation: TrackingReservation }
  | { kind: 'api_payment'; reference: string; events: ApiPaymentEventRow[] };
