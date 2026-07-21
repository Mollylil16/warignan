import { apiBaseURL } from '../services/api';

/**
 * Préfixe les chemins `/uploads/...` avec l'origine du serveur API.
 * Gère aussi les URLs Cloudinary (déjà absolues) et le cas Vercel (apiBaseURL absolue).
 */
export function absoluteMediaUrl(path: string): string {
  // URLs déjà absolues (Cloudinary, etc.) → pas de transformation
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // Calcul de l'origine backend
  let origin: string;
  if (apiBaseURL.startsWith('http://') || apiBaseURL.startsWith('https://')) {
    // Production Vercel : apiBaseURL = "https://backend.vercel.app/api"
    // On enlève le suffixe /api pour obtenir l'origine du backend
    origin = apiBaseURL.replace(/\/api\/?$/, '');
  } else {
    // Dev (proxy Vite) : apiBaseURL = "/api" → même origine
    origin = '';
  }

  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
