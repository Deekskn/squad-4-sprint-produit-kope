import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '../server/utils/tokens.js';

const SECRET = 'test-secret-32-bytes-very-long-xx';

describe('tokens.js (JWT HS256)', () => {
  it('signe et vérifie un token valide', () => {
    const token = signToken({ sub: 42, role: 'client' }, SECRET, 3600);
    const payload = verifyToken(token, SECRET);
    expect(payload.sub).toBe(42);
    expect(payload.role).toBe('client');
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it('rejette un token signé avec un autre secret', () => {
    const token = signToken({ sub: 1, role: 'admin' }, SECRET, 3600);
    expect(() => verifyToken(token, 'autre-secret')).toThrow(/Signature invalide/);
  });

  it('rejette un payload modifié', () => {
    const token = signToken({ sub: 1, role: 'client' }, SECRET, 3600);
    const [h, b, s] = token.split('.');
    const tampered = `${h}.${Buffer.from(JSON.stringify({ sub: 1, role: 'admin', exp: Math.floor(Date.now() / 1000) + 3600 })).toString('base64url')}.${s}`;
    expect(() => verifyToken(tampered, SECRET)).toThrow(/Signature invalide/);
  });

  it('rejette un token expiré', () => {
    const token = signToken({ sub: 1, role: 'client' }, SECRET, -10);
    expect(() => verifyToken(token, SECRET)).toThrow(/expiré/);
  });

  it('rejette des formats invalides', () => {
    expect(() => verifyToken('abc', SECRET)).toThrow();
    expect(() => verifyToken('', SECRET)).toThrow();
    expect(() => verifyToken(null, SECRET)).toThrow();
  });
});
