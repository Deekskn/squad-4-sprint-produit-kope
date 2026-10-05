import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { MOCK_TRADES, MOCK_ZONES } from '@/mocks/appMock.js';

export function listTrades() {
  return callApi(
    () => api.get('/trades').then((r) => r.trades || []),
    async () => MOCK_TRADES,
  );
}

export function listZones() {
  return callApi(
    () => api.get('/zones').then((r) => r.zones || []),
    async () => MOCK_ZONES,
  );
}

export default { listTrades, listZones };
