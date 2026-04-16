import { apiBaseURL } from '../services/api';

/** Préfixe les chemins `/uploads/...` avec l’origine du serveur API. */
export function absoluteMediaUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const origin = apiBaseURL.replace(/\/api\/?$/, '');
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
}
