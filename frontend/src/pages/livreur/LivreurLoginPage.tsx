import { type FormEvent, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { apiErrorMessage } from '../../services/api';

const LivreurLoginPage = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loginByUsername = useAuthStore((s) => s.loginByUsername);
  const logout = useAuthStore((s) => s.logout);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Si déjà connecté comme livreur, rediriger vers l'espace livreur
  useEffect(() => {
    if (user?.role === 'livreur') {
      void navigate('/livreur', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      const u = await loginByUsername(username.trim(), password);
      if (u.role !== 'livreur') {
        logout();
        setErr("Ce compte n'est pas un compte livreur.");
        return;
      }
      void navigate('/livreur', { replace: true });
    } catch (e) {
      setErr(apiErrorMessage(e, "Nom d'utilisateur ou mot de passe incorrect."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070707] px-4 text-white">
      <div className="w-full max-w-sm">
        {/* En-tête */}
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-tiktok-pink/15">
            <Truck className="h-7 w-7 text-tiktok-pink" strokeWidth={2} />
          </div>
          <h1 className="text-xl font-bold text-tiktok-pink">Espace livreur</h1>
          <p className="mt-1 text-xs text-neutral-500">Warignan Shop — Connexion livreur</p>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-white/10 bg-[#111] p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">
                Nom d'utilisateur
              </label>
              <input
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Koné Mamadou"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-cyan/50 focus:outline-none"
              />
              <p className="mt-1 text-[10px] text-neutral-600">
                Ton nom tel qu'il t'a été communiqué par la vendeuse.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-neutral-400">
                Mot de passe (6 caractères)
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full rounded-xl border border-white/10 bg-black px-4 py-2.5 text-sm text-white placeholder:text-neutral-600 focus:border-tiktok-cyan/50 focus:outline-none"
              />
            </div>

            {err && (
              <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">{err}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-tiktok-pink py-3 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
            >
              {busy ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[10px] text-neutral-700">
          Mot de passe oublié ? Contacte la vendeuse pour obtenir un nouveau compte.
        </p>
      </div>
    </div>
  );
};

export default LivreurLoginPage;
