import { describe, it, expect, vi, afterEach } from 'vitest';
import { callApi, isMockMode, enableMockMode, resetMockMode } from '../src/shared/lib/dataSource.js';

afterEach(() => {
  resetMockMode();
});

describe('dataSource.callApi', () => {
  it('utilise l API quand elle répond', async () => {
    const apiFn = vi.fn(async () => 'api-ok');
    const mockFn = vi.fn(async () => 'mock-ok');
    const r = await callApi(apiFn, mockFn);
    expect(r).toBe('api-ok');
    expect(mockFn).not.toHaveBeenCalled();
    expect(isMockMode()).toBe(false);
  });

  it('bascule en mock sur erreur réseau (TypeError) et active le mode démo', async () => {
    const apiFn = vi.fn(async () => { throw new TypeError('fetch failed'); });
    const mockFn = vi.fn(async () => 'mock-ok');
    const r = await callApi(apiFn, mockFn);
    expect(r).toBe('mock-ok');
    expect(isMockMode()).toBe(true);
  });

  it('bascule en mock sur erreur 5xx', async () => {
    const apiFn = vi.fn(async () => { throw Object.assign(new Error('down'), { status: 503 }); });
    const mockFn = vi.fn(async () => 'mock-ok');
    const r = await callApi(apiFn, mockFn);
    expect(r).toBe('mock-ok');
    expect(isMockMode()).toBe(true);
  });

  it('ne bascule PAS sur erreur métier 409', async () => {
    const apiFn = vi.fn(async () => { throw Object.assign(new Error('déjà pris'), { status: 409 }); });
    const mockFn = vi.fn(async () => 'mock-ok');
    await expect(callApi(apiFn, mockFn)).rejects.toThrow('déjà pris');
    expect(mockFn).not.toHaveBeenCalled();
    expect(isMockMode()).toBe(false);
  });

  it('en mode mock, n appelle plus l API', async () => {
    enableMockMode();
    const apiFn = vi.fn(async () => 'api-ok');
    const mockFn = vi.fn(async () => 'mock-ok');
    const r = await callApi(apiFn, mockFn);
    expect(r).toBe('mock-ok');
    expect(apiFn).not.toHaveBeenCalled();
  });
});
