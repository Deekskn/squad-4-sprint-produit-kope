import { api } from '@/shared/lib/api.js';
import { callApi } from '@/shared/lib/dataSource.js';
import { cached, cacheInvalidate } from '@/shared/lib/cache.js';
import { MOCK_TRADES, MOCK_ZONES } from '@/shared/mocks/appMock.js';

export function listTrades() {
  return cached('reference:trades', 5 * 60_000, () =>
    callApi(
      () => api.get('/trades').then((r) => r.trades || []),
      async () => MOCK_TRADES,
    ),
  );
}

export function listZones() {
  return cached('reference:zones', 5 * 60_000, () =>
    callApi(
      () => api.get('/zones').then((r) => r.zones || []),
      async () => MOCK_ZONES,
    ),
  );
}

export function invalidateReferenceCache() {
  cacheInvalidate('reference:');
}