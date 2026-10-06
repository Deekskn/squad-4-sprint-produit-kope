import { describe, expect, it, vi } from 'vitest';
import * as repository from '../server/modules/reviews/reviews.repository.js';

describe('US-15 reviews backend', () => {
  it('returns recent visible reviews with only the client first name and last initial', async () => {
    const rows = [
      {
        id: 17,
        rating: 5,
        comment: 'Travail soigné',
        createdAt: '2026-10-03T12:00:00.000Z',
        client: { firstName: 'Awa', lastName: 'D' },
        total: 1,
      },
    ];
    const db = { query: vi.fn().mockResolvedValue({ rows }) };

    const result = await repository.listByProfessional(25, { limit: 10, offset: 0 }, db);

    const [query, params] = db.query.mock.calls[0];
    expect(query).toContain("'firstName', u.first_name");
    expect(query).toContain("'lastName', COALESCE(UPPER(LEFT(u.last_name, 1)), '')");
    expect(query).toContain('WHERE r.professional_id = $1 AND NOT r.is_hidden');
    expect(query).toMatch(/ORDER BY r\.created_at DESC, r\.id DESC/);
    expect(params).toEqual([25, 10, 0]);
    expect(result[0].client).toEqual({ firstName: 'Awa', lastName: 'D' });
  });

  it('calculates one-decimal average and count from visible reviews on every read', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [{ average: 4.5, count: 2 }] }) };

    const summary = await repository.getSummary(25, db);

    const [query, params] = db.query.mock.calls[0];
    expect(query).toContain('ROUND(AVG(rating), 1)::float8 AS average');
    expect(query).toContain('COUNT(*)::int AS count');
    expect(query).toContain('WHERE professional_id = $1 AND NOT is_hidden');
    expect(params).toEqual([25]);
    expect(summary).toEqual({ average: 4.5, count: 2 });
  });

  it('stores a review so the next summary read reflects the new aggregate', async () => {
    const db = {
      query: vi.fn()
        .mockResolvedValueOnce({ rows: [{ id: 18, rating: 5, comment: null, createdAt: '2026-10-04T12:00:00.000Z' }] })
        .mockResolvedValueOnce({ rows: [{ average: 4.7, count: 3 }] }),
    };

    await repository.create({ clientId: 8, professionalId: 25, rating: 5, comment: null }, db);
    const summary = await repository.getSummary(25, db);

    expect(db.query.mock.calls[0][0]).toContain('INSERT INTO reviews');
    expect(db.query.mock.calls[1][0]).toContain('ROUND(AVG(rating), 1)');
    expect(summary).toEqual({ average: 4.7, count: 3 });
  });
});
