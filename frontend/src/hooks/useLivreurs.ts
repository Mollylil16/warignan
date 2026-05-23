import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export type LivreurRow = {
  id: string;
  displayName: string;
  phone: string | null;
  createdAt: string;
  livraisonsActives: number;
};

export type LivreurCreated = LivreurRow & {
  motDePasse: string;
  message: string;
};

export function useLivreurs() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ['admin', 'livreurs', token],
    queryFn: async () => {
      const { data } = await api.get<{ data: LivreurRow[] }>('/admin/livreurs');
      return data.data;
    },
    enabled: Boolean(token),
  });
}

export async function createLivreur(body: {
  displayName: string;
  phone: string;
}): Promise<LivreurCreated> {
  const { data } = await api.post<LivreurCreated>('/admin/livreurs', body);
  return data;
}

export async function deleteLivreur(id: string): Promise<void> {
  await api.delete(`/admin/livreurs/${id}`);
}
