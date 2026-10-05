import { describe, it, expect, vi } from 'vitest';
import { rateLimit } from '../server/middlewares/rateLimit.js';
import { hashToken } from '../server/modules/auth/refreshTokens.repository.js';

function mockRes() {
  const res = {};
  res.status = vi.fn(() => res);
  res.json = vi.fn(() => res);
  res.set = vi.fn(() => res);
  return res;
}

describe('rateLimit', () => {
  it('laisse passer sous la limite', () => {
    const mw = rateLimit({ max: 3, key: 'test-ok' });
    const req = { ip: '1.2.3.4' };
    let calls = 0;
    for (let i = 0; i < 3; i += 1) mw(req, mockRes(), () => { calls += 1; });
    expect(calls).toBe(3);
  });

  it('bloque avec 429 au-delà de la limite', () => {
    const mw = rateLimit({ max: 2, key: 'test-block' });
    const req = { ip: '5.6.7.8' };
    mw(req, mockRes(), () => {});
    mw(req, mockRes(), () => {});
    const res = mockRes();
    let called = false;
    mw(req, res, () => { called = true; });
    expect(called).toBe(false);
    expect(res.status).toHaveBeenCalledWith(429);
  });

  it('isole les compteurs par clé', () => {
    const a = rateLimit({ max: 1, key: 'a' });
    const b = rateLimit({ max: 1, key: 'b' });
    const req = { ip: '9.9.9.9' };
    a(req, mockRes(), () => {});
    let ok = false;
    b(req, mockRes(), () => { ok = true; });
    expect(ok).toBe(true);
  });
});

describe('hashToken', () => {
  it('produit un sha256 hex de 64 caractères', () => {
    const h = hashToken('mon-token');
    expect(h).toMatch(/^[a-f0-9]{64}$/);
  });

  it('est déterministe et sensible au token', () => {
    expect(hashToken('a')).toBe(hashToken('a'));
    expect(hashToken('a')).not.toBe(hashToken('b'));
  });
});
