import { QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { apiErrorMessage } from '../services/api';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
    mutations: {
      onError: (err) => {
        // L'intercepteur axios affiche déjà un toast pour les erreurs HTTP.
        // On affiche ici les erreurs réseau (pas de réponse) qui passent au-dessus.
        if (err instanceof Error && !('response' in err)) {
          toast.error(apiErrorMessage(err, 'Erreur réseau'));
        }
      },
    },
  },
});
