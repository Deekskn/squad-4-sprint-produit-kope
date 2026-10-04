import { api } from '@/lib/api.js';

export function listTrades() {
  return api.get('/trades').then((r) => r.trades || []);
}
export function listZones() {
  return api.get('/zones').then((r) => r.zones || []);
}

export default { listTrades, listZones };
