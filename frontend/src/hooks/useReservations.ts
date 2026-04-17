import { useQuery } from '@tanstack/react-query';
import { STAFF_LIST_LIMIT } from '../constants/apiPagination';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type DepositCoverage = 'none' | 'partial' | 'full';

export type StaffReservationRow = {
  id: string;
  reference: string;
  clientName: string;
  clientPhone: string;
  productsSummary: string;
  subtotalFcfa?: number;
  discountFcfa?: number;
  promoCode?: string | null;
  totalFcfa: number;
  depositFcfa: number;
  depositStatus: string;
  workflow: string;
  createdAt: string;
  paidFcfaConfirmed: number;
  depositShortfallFcfa: number;
  depositCoverage: DepositCoverage;
};

export function useReservationsList(params?: {
  q?: string;
  workflow?: string;
  depositStatus?: string;
  fromISO?: string;
  toISO?: string;
}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [
      'reservations',
      'staff',
      token,
      params?.q ?? '',
      params?.workflow ?? '',
      params?.depositStatus ?? '',
      params?.fromISO ?? '',
      params?.toISO ?? '',
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffReservationRow[] }>('/reservations', {
        params: { page: 1, limit: STAFF_LIST_LIMIT, ...params },
      });
      return data.data.map((row) => {
        const paid = row.paidFcfaConfirmed ?? 0;
        const dep = row.depositFcfa;
        const short = row.depositShortfallFcfa ?? Math.max(0, dep - paid);
        const cov =
          row.depositCoverage ??
          (paid >= dep ? 'full' : paid > 0 ? 'partial' : ('none' as const));
        return {
          ...row,
          paidFcfaConfirmed: paid,
          depositShortfallFcfa: short,
          depositCoverage: cov,
        };
      });
    },
    enabled: Boolean(token),
  });
}
