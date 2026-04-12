import { mockAdminUsers } from '../../data/adminMock';

const roleLabel: Record<(typeof mockAdminUsers)[0]['role'], string> = {
  admin: 'Administrateur',
  vendeuse: 'Vendeuse',
  livreur: 'Livreur',
};

const UsersPage = () => {
  return (
    <div className="max-w-4xl">
      <h1 className="mb-2 text-2xl font-bold text-white">Utilisateurs</h1>
      <p className="mb-8 text-sm text-neutral-500">
        Comptes internes (démo). Authentification et CRUD à brancher sur le backend.
      </p>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-white/10 bg-[#141414] text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Nom</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Rôle</th>
              <th className="px-4 py-3 font-semibold">Statut</th>
              <th className="px-4 py-3 font-semibold">Dernière connexion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-[#111]">
            {mockAdminUsers.map((u) => (
              <tr key={u.id} className="text-neutral-300">
                <td className="px-4 py-3 font-medium text-white">{u.displayName}</td>
                <td className="px-4 py-3 font-mono text-xs text-neutral-400">{u.email}</td>
                <td className="px-4 py-3">{roleLabel[u.role]}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.active ? 'text-status-green' : 'text-neutral-600'
                    }
                  >
                    {u.active ? 'Actif' : 'Inactif'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-neutral-500">
                  {new Date(u.lastLogin).toLocaleString('fr-FR', {
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
