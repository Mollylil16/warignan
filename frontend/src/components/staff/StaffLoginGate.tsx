import { type FormEvent, useEffect, useState, type ReactNode } from 'react';
import { useAuthStore, type AppRole } from '../../store/authStore';
import { apiErrorMessage } from '../../services/api';

type Props = {
  title: string;
  allowedRoles: AppRole[];
  children: ReactNode;
};

const StaffLoginGate = ({ title, allowedRoles, children }: Props) => {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const fetchMe = useAuthStore((s) => s.fetchMe);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token && !user) void fetchMe();
  }, [token, user, fetchMe]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const u = await login(email.trim(), password);
      if (!allowedRoles.includes(u.role)) {
        logout();
        setErr('Ce compte n’a pas accès à cet espace.');
      }
    } catch (e) {
      setErr(apiErrorMessage(e, 'Identifiants invalides ou serveur injoignable.'));
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] px-4 text-white">
        <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#111] p-6 shadow-xl">
          <h1 className="mb-1 text-lg font-bold text-tiktok-pink">{title}</h1>
          <p className="mb-6 text-xs text-neutral-500">Connexion sécurisée (API)</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">
                Identifiant ou e-mail
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="warignan"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-cyan/50 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-neutral-600">
                Identifiant court (ex. <span className="font-mono text-neutral-500">warignan</span>)
                ou e-mail complet.
              </p>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">Mot de passe</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-black px-3 py-2 text-sm text-white focus:border-tiktok-cyan/50 focus:outline-none"
              />
            </div>
            {err && <p className="text-xs text-red-400">{err}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-tiktok-pink py-2.5 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
            >
              {busy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#070707] text-neutral-400">
        Chargement du profil…
      </div>
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070707] px-4 text-center text-white">
        <p className="text-sm text-neutral-400">Accès refusé pour le rôle « {user.role} ».</p>
        <button
          type="button"
          onClick={() => logout()}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/5"
        >
          Changer de compte
        </button>
      </div>
    );
  }

  return <>{children}</>;
};

export default StaffLoginGate;
