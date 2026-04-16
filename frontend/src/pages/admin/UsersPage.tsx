import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useAuthStore } from '../../store/authStore';

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
};

const roleLabel: Record<string, string> = {
  admin: 'Administrateur',
  vendeuse: 'Vendeuse',
  livreur: 'Livreur',
  client: 'Cliente',
};

const UsersPage = () => {
  const token = useAuthStore((s) => s.token);
  const q = useQuery({
    queryKey: ['admin', 'users', token],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserRow[] }>('/users');
      return data.data;
    },
    enabled: Boolean(token),
  });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Utilisateurs</h1>
      <p className="mb-8 text-sm text-neutral-500">Liste des comptes enregistrés (API).</p>

      {q.error && (
        <p className="mb-4 text-sm text-red-300">{String(q.error)}</p>
      )}
      {q.isPending && <p className="mb-4 text-sm text-neutral-500">Chargement…</p>}

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#141414] text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Rôle</th>
              <th className="px-4 py-3 font-semibold">Création</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#111]">
            {(q.data ?? []).map((u) => (
              <tr key={u.id} className="text-neutral-300">
                <td className="px-4 py-3 font-medium text-white">{u.displayName}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{u.email}</td>
                <td className="px-4 py-3">{roleLabel[u.role] ?? u.role}</td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {new Date(u.createdAt).toLocaleString('fr-FR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersPage;
