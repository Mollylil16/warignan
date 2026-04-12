import axios from 'axios';

/**
 * Client HTTP unique pour le futur backend.
 * Définir VITE_API_BASE_URL dans .env (ex. http://localhost:3000/api).
 */
const baseURL =
  typeof import.meta.env.VITE_API_BASE_URL === 'string'
    ? import.meta.env.VITE_API_BASE_URL.trim()
    : '';

export const api = axios.create({
  baseURL: baseURL || undefined,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Les appels réels et la gestion d’erreur globale viendront avec le backend.
    return Promise.reject(err);
  }
);
