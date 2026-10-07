import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/api.js', () => ({
  api: { get: vi.fn() },
}));

import { api } from '../src/lib/api.js';
import { searchProfessionals } from '../src/features/search/hooks/useSearch.js';

describe('searchProfessionals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends métier, zone, keyword, and page to the API', async () => {
    await searchProfessionals({ trade: '2', zone: '3', q: 'plombier', page: '2' });

    expect(api.get).toHaveBeenCalledWith('/professionals', {
      trade: '2',
      zone: '3',
      q: 'plombier',
      page: '2',
    });
  });

  it('allows a zone-only search', async () => {
    await searchProfessionals({ zone: '3' });

    expect(api.get).toHaveBeenCalledWith('/professionals', { zone: '3' });
  });
});