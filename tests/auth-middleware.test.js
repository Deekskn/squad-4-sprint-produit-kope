import { describe, it, expect } from 'vitest';
import { requireAuth } from '../server/middlewares/requireAuth.js';
import { requireRole } from '../server/middlewares/requireRole.js';
import { signToken } from '../server/utils/tokens.js';

// requireAuth/requireRole utilisent env.ACCESS_TOKEN_SECRET — on génère le token avec le même env.
import { env } from '../server/config/env.js';

function bearer(payload) {
  return { headers: { authorization: `Bearer ${signToken(payload, env.ACCESS_TOKEN_SECRET, 3600)}` } };
}

describe('requireAuth', () => {
  it('accepte un Bearer token valide et remplit req.user', () => {
    const req = bearer({ sub: 7, role: 'client' });
    let called = false;
    requireAuth(req, {}, () => { called = true; });
    expect(called).toBe(true);
    expect(req.user).toEqual({ id: 7, role: 'client' });
  });

  it('Bearer invalide + session valide : retombe sur la session (flag bearerExpired)', () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' }, session: { user: { id: 5, role: 'client' } } };
    let called = false;
    requireAuth(req, {}, () => { called = true; });
    expect(called).toBe(true);
    expect(req.user.id).toBe(5);
    expect(req.bearerExpired).toBe(true);
  });

  it('Bearer invalide + sans session : 401 Connexion requise', () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' }, session: {} };
    expect(() => requireAuth(req, {}, () => {})).toThrow(/Connexion requise/);
  });

  it('rejette sans session ni token', () => {
    const req = { headers: {}, session: {} };
    expect(() => requireAuth(req, {}, () => {})).toThrow(/Connexion requise/);
  });

  it('accepte la session cookie en fallback', () => {
    const req = { headers: {}, session: { user: { id: 3, role: 'admin' } } };
    let called = false;
    requireAuth(req, {}, () => { called = true; });
    expect(called).toBe(true);
    expect(req.user.role).toBe('admin');
  });
});

describe('requireRole', () => {
  it('autorise le bon rôle via Bearer', () => {
    const mw = requireRole('professional');
    const req = bearer({ sub: 1, role: 'professional' });
    let called = false;
    mw(req, {}, () => { called = true; });
    expect(called).toBe(true);
  });

  it('refuse un mauvais rôle (403)', () => {
    const mw = requireRole('admin');
    const req = bearer({ sub: 1, role: 'client' });
    expect(() => mw(req, {}, () => {})).toThrow(/Accès refusé/);
  });
});
