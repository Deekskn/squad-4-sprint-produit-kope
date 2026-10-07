import { useSyncExternalStore } from 'react';

const forcedMocks = import.meta.env?.VITE_USE_MOCKS === 'true';
const isProd = import.meta.env?.PROD === true;

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
  if (isProd && !forcedMocks) return;
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

export async function callApi(apiFn, mockFn) {
  if (mockMode) return mockFn();
  try {
    return await apiFn();
  } catch (err) {
    // En production sans flag explicite, pas de fallback : l'erreur remonte.
    if (isProd && !forcedMocks) throw err;
    if (isUnavailable(err)) {
      enableMockMode();
      return mockFn();
    }
    throw err;
  }
}
