import { describe, expect, it, vi } from 'vitest';
import { searchQuerySchema } from '../server/modules/search/search.schemas.js';

vi.mock('../server/db/pool.js', () => ({
  pool: { query: vi.fn() },
}));

import { pool } from '../server/db/pool.js';
import { searchPublished } from '../server/modules/search/search.repository.js';

describe('searchQuerySchema', () => {
  it.each([
    [{}],
    [{ q: '   ' }],
    [{ trade: '2' }],
    [{ zone: '3' }],
    [{ q: 'plombier' }],
    [{ trade: '2', zone: '3', q: 'nom' }],
  ])('accepts a search with criteria %o', (query) => {
    expect(searchQuerySchema.safeParse(query).success).toBe(true);
  });

  it.each([{ trade: 'invalid' }])('rejects invalid criteria %o', (query) => {
    expect(searchQuerySchema.safeParse(query).success).toBe(false);
  });
});

describe('searchPublished', () => {
  it('binds optional filters and pagination to the matching SQL parameters', async () => {
    pool.query.mockResolvedValue({ rows: [] });

    await searchPublished({
      tradeId: 2,
      zoneId: 3,
      keyword: 'plombier',
      limit: 10,
      offset: 20,
    });

    const [sql, values] = pool.query.mock.calls[0];
    expect(sql).toContain("p.display_name ILIKE '%' || $3 || '%'");
    expect(sql).toContain('LIMIT $4 OFFSET $5');
    expect(values).toEqual([2, 3, 'plombier', 10, 20]);
  });
});