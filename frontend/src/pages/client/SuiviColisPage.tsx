import { type FormEvent, useState } from 'react';
import { Search, Package, CheckCircle, Truck, Clock } from 'lucide-react';
import { api, apiErrorMessage } from '../../services/api';

type SuiviColis = {
  numeroSuivi: string;
  orderRef: string;
  clientName: string;
  address: string;
  dateISO: string;
  windowLabel: string;
  status: 'planned' | 'assigned' | 'out' | 'done';
  statusLibelle: string;
  courierName: string | null;
};

const ETAPES: Array<{ status: SuiviColis['status']; label: string; icon: React.ReactNode }> = [
  { status: 'planned', label: 'En préparation', icon: <Package className="h-5 w-5" /> },
  { status: 'assigned', label: 'Pris en charge', icon: <Clock className="h-5 w-5" /> },
  { status: 'out', label: 'En cours de livraison', icon: <Truck className="h-5 w-5" /> },
  { status: 'done', label: 'Livré', icon: <CheckCircle className="h-5 w-5" /> },
];

const ORDER: Record<SuiviColis['status'], number> = {
  planned: 0,
  assigned: 1,
  out: 2,
  done: 3,
};

const SuiviColisPage = () => {
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<SuiviColis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ref = query.trim().toUpperCase();
    if (!ref) return;

    setError(null);
    setResult(null);
    setBusy(true);
    try {
      const { data } = await api.get<SuiviColis>(`/suivi/${ref}`);
      setResult(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Numéro de suivi introuvable.'));
    } finally {
      setBusy(false);
    }
  };

  const currentStep = result ? ORDER[result.status] : -1;

  return (
    <main className="mx-auto max-w-lg px-4 py-8 text-white sm:max-w-xl sm:py-10">
      <h1
        className="mb-2 text-center text-xl font-bold sm:text-2xl"
        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
      >
        Suivi de colis
      </h1>
      <p className="mb-6 text-center text-sm text-neutral-400">
        Saisis le numéro de suivi communiqué par Warignan (format&nbsp;WRG-XXXXXX).
      </p>

      {/* Formulaire de recherche */}
      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="WRG-482910"
          className="h-11 flex-1 rounded-xl border border-white/10 bg-[#111] px-4 font-mono text-sm uppercase text-white placeholder:normal-case placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-tiktok-cyan"
        />
        <button
          type="submit"
          disabled={busy}
          className="flex h-11 items-center gap-1.5 rounded-xl bg-tiktok-pink px-4 text-sm font-bold text-white hover:brightness-110 disabled:opacity-50"
        >
          <Search className="h-4 w-4" />
          {busy ? '…' : 'Suivre'}
        </button>
      </form>

      {error && (
        <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </p>
      )}

      {result && (
        <div className="space-y-4">
          {/* En-tête colis */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-5">
            <p className="mb-1 font-mono text-xs text-neutral-500">Numéro de suivi</p>
            <p className="mb-3 font-mono text-lg font-bold text-tiktok-cyan">{result.numeroSuivi}</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-neutral-500">Destinataire</p>
                <p className="font-medium text-white">{result.clientName}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Référence commande</p>
                <p className="font-mono text-white">{result.orderRef}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Date prévue</p>
                <p className="text-white">{result.dateISO}</p>
              </div>
              <div>
                <p className="text-xs text-neutral-500">Créneau</p>
                <p className="text-white">{result.windowLabel}</p>
              </div>
              {result.courierName && (
                <div className="col-span-2">
                  <p className="text-xs text-neutral-500">Livreur</p>
                  <p className="text-white">{result.courierName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Timeline des statuts */}
          <div className="rounded-xl border border-white/10 bg-[#111] p-5">
            <p className="mb-5 text-xs font-semibold uppercase tracking-wide text-neutral-500">
              Suivi en temps réel
            </p>
            <ol className="relative space-y-0">
              {ETAPES.map((etape, i) => {
                const isPast = i < currentStep;
                const isCurrent = i === currentStep;
                const isFuture = i > currentStep;

                return (
                  <li key={etape.status} className="flex gap-4 pb-6 last:pb-0">
                    {/* Trait vertical */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                          isCurrent
                            ? 'border-tiktok-pink bg-tiktok-pink/20 text-tiktok-pink'
                            : isPast
                            ? 'border-status-green bg-status-green/20 text-status-green'
                            : 'border-white/10 bg-white/5 text-neutral-600'
                        }`}
                      >
                        {etape.icon}
                      </div>
                      {i < ETAPES.length - 1 && (
                        <div
                          className={`mt-1 w-0.5 flex-1 ${
                            isPast ? 'bg-status-green/50' : 'bg-white/10'
                          }`}
                          style={{ minHeight: '1.5rem' }}
                        />
                      )}
                    </div>

                    {/* Texte */}
                    <div className="pt-1">
                      <p
                        className={`text-sm font-semibold ${
                          isCurrent
                            ? 'text-tiktok-pink'
                            : isPast
                            ? 'text-status-green'
                            : 'text-neutral-600'
                        }`}
                      >
                        {etape.label}
                        {isCurrent && (
                          <span className="ml-2 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-tiktok-pink align-middle" />
                        )}
                      </p>
                      {isCurrent && !isFuture && (
                        <p className="mt-0.5 text-xs text-neutral-500">{result.statusLibelle}</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </main>
  );
};

export default SuiviColisPage;
