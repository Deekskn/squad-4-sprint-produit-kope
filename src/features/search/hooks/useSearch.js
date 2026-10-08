import { useCallback, useEffect, useState } from 'react';
import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { searchMock } from '@/shared/mocks/appMock.js';
import { cached } from '@/shared/lib/cache.js';
import { PAGE_SIZE } from '@/shared/lib/constants.js';

export async function searchProfessionals({ trade, zone, q, page }) {
  const params = {};
  if (trade) params.trade = String(trade);
  if (zone) params.zone = String(zone);
  if (q) params.q = q;
  if (page) params.page = String(page);
  return callApi(
    () =>
      cached(`search:${trade ?? ''}:${zone ?? ''}:${q ?? ''}:${page ?? 1}`, 30_000, () =>
        api.get('/professionals', params),
      ),
    async () => searchMock({ trade, zone, q, page: page || 1, pageSize: PAGE_SIZE }),
  );
}

export function useSearch({ trade, zone, q, page, sort }) {
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
      const data = await searchProfessionals({ trade, zone, q, page: page || 1 });
      let sorted = data;
      if (sort === 'rating')
        sorted = { ...data, items: [...data.items].sort((a, b) => Number(b.rating?.average ?? 0) - Number(a.rating?.average ?? 0)) };
      else if (sort === 'experience')
        sorted = { ...data, items: [...data.items].sort((a, b) => Number(b.yearsExperience ?? 0) - Number(a.yearsExperience ?? 0)) };
      setResults(sorted);
    } catch (err) {
      setResults(null);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [trade, zone, q, page, sort]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    run();
  }, [run]);

  return { results, loading, error, refresh: run };
}

export default { searchProfessionals, useSearch };
