import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { api, apiErrorMessage } from '../../services/api';
import { useAuthStore, type AppRole } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';

type UserRow = {
  id: string;
  email: string;
  displayName: string;
  role: AppRole;
  createdAt: string;
};

const roleLabel: Record<string, string> = {
  admin: 'Administrateur',
  vendeuse: 'Vendeuse',
  livreur: 'Livreur',
  client: 'Cliente',
};

const roleBadge: Record<string, string> = {
  admin: 'bg-tiktok-cyan/15 text-tiktok-cyan',
  vendeuse: 'bg-tiktok-pink/15 text-tiktok-pink',
  livreur: 'bg-reserve-purple/15 text-reserve-purple',
  client: 'bg-white/10 text-neutral-400',
};

const ROLES: AppRole[] = ['admin', 'vendeuse', 'livreur', 'client'];

const UsersPage = () => {
  const token = useAuthStore((s) => s.token);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [roleErr, setRoleErr] = useState<string | null>(null);

  const q = useQuery({
    queryKey: ['admin', 'users', token],
    queryFn: async () => {
      const { data } = await api.get<{ data: UserRow[] }>('/users');
      return data.data;
    },
    enabled: Boolean(token),
  });

  const patchRole = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: AppRole }) => {
      await api.patch(`/users/${id}/role`, { role });
    },
    onSuccess: () => {
      setEditRoleId(null);
      setRoleErr(null);
      void qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err) => setRoleErr(apiErrorMessage(err, 'Impossible de modifier le rôle.')),
  });

  const users = q.data ?? [];
  const filtered = debouncedSearch
    ? users.filter(
        (u) =>
          u.displayName.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
          u.role.includes(debouncedSearch.toLowerCase())
      )
    : users;

  return (
    <div className="max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Utilisateurs</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Liste des comptes enregistrés. Cliquez sur un rôle pour le modifier.
      </p>

      {q.error && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
          {String(q.error)}
        </p>
      )}

      <div className="mb-4 relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" strokeWidth={2} aria-hidden />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nom, email, rôle…"
          className="h-10 w-full rounded-lg border border-white/10 bg-[#111] pl-10 pr-3 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-cyan/40 focus:outline-none"
        />
      </div>

      {roleErr && (
        <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
          {roleErr}
        </p>
      )}

      {q.isPending ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex animate-pulse gap-4 border-b border-white/5 bg-[#111] px-4 py-3">
              <div className="h-4 w-28 rounded bg-white/5" />
              <div className="h-4 w-40 rounded bg-white/5" />
              <div className="h-4 w-20 rounded bg-white/5" />
              <div className="ml-auto h-4 w-24 rounded bg-white/5" />
            </div>
          ))}
        </div>
      ) : (
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-neutral-600">
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isSelf = u.id === currentUserId;
                  const isEditing = editRoleId === u.id;
                  return (
                    <tr key={u.id} className="text-neutral-300 hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-medium text-white">{u.displayName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-400">{u.email}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue={u.role}
                              disabled={patchRole.isPending}
                              onChange={(e) =>
                                patchRole.mutate({ id: u.id, role: e.target.value as AppRole })
                              }
                              className="rounded-lg border border-white/15 bg-[#0a0a0a] px-2 py-1 text-xs text-white focus:outline-none"
                              autoFocus
                            >
                              {ROLES.map((r) => (
                                <option key={r} value={r}>
                                  {roleLabel[r]}
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => { setEditRoleId(null); setRoleErr(null); }}
                              className="text-xs text-neutral-500 hover:text-neutral-300"
                            >
                              Annuler
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={isSelf}
                            onClick={() => setEditRoleId(u.id)}
                            title={isSelf ? 'Impossible de modifier son propre rôle' : 'Cliquer pour modifier'}
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${roleBadge[u.role] ?? 'bg-white/10 text-neutral-400'} ${isSelf ? 'cursor-default opacity-60' : 'hover:opacity-80 cursor-pointer'}`}
                          >
                            {roleLabel[u.role] ?? u.role}
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-neutral-500">
                        {new Date(u.createdAt).toLocaleString('fr-FR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
