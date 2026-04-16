import { useQuery } from '@tanstack/react-query';
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
  target: PaymentTarget;
};

export function usePaymentsList(params?: {
  q?: string;
  flow?: string;
  provider?: string;
  status?: string;
  fromISO?: string;
  toISO?: string;
  limit?: number;
}) {
  const token = useAuthStore((s) => s.token);
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
      params?.limit ?? '',
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffPaymentEventRow[] }>('/payments', {
        params: { limit: 200, ...params },
      });
      return data.data;
    },
    enabled: Boolean(token),
  });
}

