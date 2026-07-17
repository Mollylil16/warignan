import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type VendeuseTodoItem = {
  kind: 'order' | 'reservation';
  reference: string;
  title: string;
  subtitle: string;
  createdAt: string;
  priority: number;
};

export type PeriodSales = {
  confirmedFcfa: number;
  expectedFcfa: number;
  ordersCount: number;
};

export type TopSellerItem = {
  code: string;
  qty: number;
  nom: string;
  prix: number;
  image: string;
};

export type VendeuseOverview = {
  kpi: {
    orders: {
      preparation: number;
      emballage: number;
      expediee: number;
      livree: number;
      shippedToday: number;
    };
    reservations: {
      awaiting_deposit: number;
      awaiting_validation: number;
      validated: number;
      cancelled: number;
    };
    payments: {
      last24h: {
        count: number;
        amountFcfaConfirmed: number;
        failedCount: number;
      };
      anomaliesLast7d: number;
    };
    sales: {
      today: PeriodSales;
      week: PeriodSales;
      month: PeriodSales;
    };
    inventory: {
      disponible: number;
      reserver: number;
      sold: number;
    };
    topSellers: TopSellerItem[];
  };
  todo: VendeuseTodoItem[];
};

export function useVendeuseOverview() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['dashboard', 'vendeuse', token],
    queryFn: async () => {
      const { data } = await api.get<VendeuseOverview>('/dashboard/vendeuse');
      return data;
    },
    enabled: Boolean(token),
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
  });
}
