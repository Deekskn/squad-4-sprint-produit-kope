import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { searchMock } from '@/mocks/appMock.js';
import { PAGE_SIZE } from '@/lib/constants.js';

export async function searchProfessionals({ trade, zone, page }) {
  const params = {};
  if (trade) params.trade = String(trade);
  if (zone) params.zone = String(zone);
  if (page) params.page = String(page);
  return callApi(
    () => api.get('/professionals', params),
    async () => searchMock({ trade, zone, page: page || 1, pageSize: PAGE_SIZE }),
  );
}

export function useSearch({ trade, zone, page }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    if (!trade) {
      setResults({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE });
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await searchProfessionals({ trade, zone, page: page || 1 });
      setResults(data);
    } catch (err) {
      setResults(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [trade, zone, page]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
  }, [run]);

  return { results, loading, error, refresh: run };
}

export default { searchProfessionals, useSearch };
