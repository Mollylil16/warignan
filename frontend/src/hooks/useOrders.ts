import { useQuery } from '@tanstack/react-query';
import { STAFF_LIST_LIMIT } from '../constants/apiPagination';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type OrderPaymentStatus = 'unpaid' | 'partial' | 'full';

export type StaffOrderRow = {
  id: string;
  reference: string;
  clientName: string;
  city: string;
  itemsSummary: string;
  subtotalFcfa?: number;
  discountFcfa?: number;
  promoCode?: string | null;
  totalFcfa: number;
  paidAt: string | null;
  /** Somme des paiements confirmés (Wave / OM / manuel) rattachés à cette commande. */
  paidFcfaConfirmed: number;
  balanceDueFcfa: number;
  paymentStatus: OrderPaymentStatus;
  courierId?: string | null;
  courierName?: string | null;
  step: string;
  createdAt: string;
};

export function useOrdersList(params?: {
  q?: string;
  step?: string;
  city?: string;
  minTotalFcfa?: number;
  maxTotalFcfa?: number;
  fromISO?: string;
  toISO?: string;
}) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: [
      'orders',
      'staff',
      token,
      params?.q ?? '',
      params?.step ?? '',
      params?.city ?? '',
      params?.minTotalFcfa ?? '',
      params?.maxTotalFcfa ?? '',
      params?.fromISO ?? '',
      params?.toISO ?? '',
    ],
    queryFn: async () => {
      const { data } = await api.get<{ data: StaffOrderRow[] }>('/orders', {
        params: { page: 1, limit: STAFF_LIST_LIMIT, ...params },
      });
      return data.data.map((row) => {
        const paid = row.paidFcfaConfirmed ?? 0;
        const total = row.totalFcfa;
        const balance = row.balanceDueFcfa ?? Math.max(0, total - paid);
        const status =
          row.paymentStatus ??
          (paid >= total ? 'full' : paid > 0 ? 'partial' : ('unpaid' as const));
        return { ...row, paidFcfaConfirmed: paid, balanceDueFcfa: balance, paymentStatus: status };
      });
    },
    enabled: Boolean(token),
  });
}
