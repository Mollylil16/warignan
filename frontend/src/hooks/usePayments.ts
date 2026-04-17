import { useQuery } from '@tanstack/react-query';
import { STAFF_LIST_LIMIT } from '../constants/apiPagination';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type PaymentTarget =
  | null
  | { kind: 'order'; id: string; reference: string; clientName: string; city: string; totalFcfa: number }
  | {
      kind: 'reservation';
      id: string;
      reference: string;
      clientName: string;
      clientPhone: string;
      totalFcfa: number;
      depositFcfa: number;
    };

export type StaffPaymentEventRow = {
  id: string;
  reference: string;
  flow: string;
  provider: string | null;
  status: string;
  amountFcfa: number;
  createdAt: string;
  match: boolean;
  /** Somme des paiements confirmés pour cette référence + flow, jusqu’à cet événement (inclus si confirmé). */
  confirmedCumulativeFcfa: number;
  /** Montant attendu pour solder l’objectif : total commande (flow order) ou acompte (flow reservation). */
  expectedFcfa: number | null;
  /** Reste à encaisser sur l’objectif après ce cumul (null si pas de cible). */
  balanceAfterFcfa: number | null;
  target: PaymentTarget;
};

export type StaffPaymentsListResponse = {
  data: StaffPaymentEventRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function usePaymentsList(params?: {
  q?: string;
  flow?: string;
  provider?: string;
  status?: string;
  fromISO?: string;
  toISO?: string;
  page?: number;
  limit?: number;
}) {
  const token = useAuthStore((s) => s.token);
  const page = params?.page ?? 1;
  const limit = params?.limit ?? STAFF_LIST_LIMIT;
  return useQuery({
    queryKey: [
      'payments',
      'staff',
      token,
      params?.q ?? '',
      params?.flow ?? '',
      params?.provider ?? '',
      params?.status ?? '',
      params?.fromISO ?? '',
      params?.toISO ?? '',
      page,
      limit,
    ],
    queryFn: async () => {
      const { data } = await api.get<StaffPaymentsListResponse>('/payments', {
        params: { page, limit, ...(params ?? {}) },
      });
      return data;
    },
    enabled: Boolean(token),
  });
}

