// Pont entre les services API et les données mock.
// - VITE_USE_MOCKS=true : toujours les mocks (démo sans backend)
// - sinon : essaie l'API, bascule en mode démo sur erreur réseau / 5xx,
//   puis toutes les requêtes suivantes utilisent les mocks.
import { useSyncExternalStore } from 'react';

const forcedMocks = import.meta.env?.VITE_USE_MOCKS === 'true';

let mockMode = forcedMocks === true;
const listeners = new Set();

function notify() {
  listeners.forEach((fn) => fn());
}

export function isMockMode() {
  return mockMode;
}

export function enableMockMode() {
  if (mockMode) return;
  mockMode = true;
  notify();
}

export function resetMockMode() {
  if (forcedMocks) return;
  mockMode = false;
  notify();
}

export function subscribeMockMode(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function useMockMode() {
  return useSyncExternalStore(subscribeMockMode, isMockMode, () => false);
}

function isUnavailable(err) {
  if (!err) return false;
  if (err instanceof TypeError) return true; // fetch réseau en échec
  if (typeof err.status === 'number' && err.status >= 500) return true;
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND' || err.code === 'ETIMEDOUT') return true;
  return false;
}

/**
 * Exécute apiFn, puis mockFn si le backend est indisponible.
 * Les erreurs métier (400, 401, 403, 404, 409) sont relancées telles quelles.
 */
export async function callApi(apiFn, mockFn) {
  if (mockMode) return mockFn();
  try {
    return await apiFn();
  } catch (err) {
    if (isUnavailable(err)) {
      enableMockMode();
      return mockFn();
    }
    throw err;
  }
}
