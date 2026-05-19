import axios from 'axios';
import { toast } from 'sonner';

/** En dev, Vite proxy `/api` → backend. En prod, définir `VITE_API_BASE_URL` si l’API est sur un autre domaine. */
const DEFAULT_API = '/api';

const rawBase =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : '';

export const apiBaseURL = rawBase || DEFAULT_API;

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

const AUTH_STORAGE_KEY = 'warignan-auth';

export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { error?: unknown } | undefined;
    if (data && typeof data.error === 'string' && data.error.trim()) return data.error;
    if (typeof err.message === 'string' && err.message.trim()) return err.message;
  }
  return fallback;
}

function tokenFromPersistedZustand(): string | null {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { state?: { token?: string | null } };
    const t = parsed?.state?.token;
    return typeof t === 'string' && t.length > 0 ? t : null;
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const token = tokenFromPersistedZustand();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (!axios.isAxiosError(err)) return Promise.reject(err);

    const status = err.response?.status;

    if (status === 401 && err.config?.headers?.Authorization) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        window.location.reload();
      }
      return Promise.reject(err);
    }

    // Affiche un toast pour les erreurs 4xx/5xx (hors 401 géré ci-dessus)
    const data = err.response?.data as { error?: string } | undefined;
    const message =
      (typeof data?.error === 'string' && data.error.trim()) ||
      err.message ||
      'Une erreur est survenue';

    if (status && status >= 400) {
      toast.error(message);
    }

    return Promise.reject(err);
  }
);

export { AUTH_STORAGE_KEY };
