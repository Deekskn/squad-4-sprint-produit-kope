import { useCallback, useEffect, useState } from 'react';

/**
 * Chargement d'une liste admin : expose { data, loading, error, reload }.
 * Remplace le triplet useState/useCallback/useEffect recopié dans chaque tableau.
 * `fetcher` doit être mémoïsé par l'appelant (useCallback).
 */
export function useAdminList(fetcher) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetcher());
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
