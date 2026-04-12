import { useCallback, useMemo, useState } from 'react';
import {
  resolveClientTracking,
  type ClientTrackingResult,
} from '../services/clientTracking';

/**
 * Recherche suivi + action « Synchroniser » (relecture locale ; remplacera un fetch API).
 */
export function useClientTracking(submittedRef: string | null) {
  const [syncToken, setSyncToken] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const result: ClientTrackingResult | null = useMemo(() => {
    if (!submittedRef?.trim()) return null;
    return resolveClientTracking(submittedRef);
  }, [submittedRef, syncToken]);

  const refresh = useCallback(() => {
    setIsSyncing(true);
    window.setTimeout(() => {
      setSyncToken((t) => t + 1);
      setLastSyncedAt(new Date());
      setIsSyncing(false);
    }, 450);
  }, []);

  return { result, refresh, lastSyncedAt, isSyncing };
}
