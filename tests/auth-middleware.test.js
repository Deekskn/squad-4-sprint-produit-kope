import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '../server/middlewares/requireAuth.js';
import { requireRole } from '../server/middlewares/requireRole.js';
import { signToken } from '../server/utils/tokens.js';

// requireAuth vérifie en base si le compte est bloqué ou suspendu : on isole cette dépendance.
vi.mock('../server/modules/auth/auth.repository.js', () => ({
  isBlocked: vi.fn().mockResolvedValue(false),
  isSuspended: vi.fn().mockResolvedValue(false),
}));

const { isBlocked, isSuspended } = await import('../server/modules/auth/auth.repository.js');

// requireAuth/requireRole utilisent env.ACCESS_TOKEN_SECRET - on génère le token avec le même env.
import { env } from '../server/config/env.js';

function bearer(payload) {
  return { headers: { authorization: `Bearer ${signToken(payload, env.ACCESS_TOKEN_SECRET, 3600)}` } };
}

function run(req) {
  return new Promise((resolve, reject) => {
    requireAuth(req, {}, (err) => (err ? reject(err) : resolve()));
  });
}

describe('requireAuth', () => {
  beforeEach(() => {
    isBlocked.mockResolvedValue(false);
    isSuspended.mockResolvedValue(false);
  });

  it('accepte un Bearer token valide et remplit req.user', async () => {
    const req = bearer({ sub: 7, role: 'client' });
    await run(req);
    expect(req.user).toEqual({ id: 7, role: 'client' });
  });

  it('Bearer invalide + session valide : retombe sur la session (flag bearerExpired)', async () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' }, session: { user: { id: 5, role: 'client' } } };
    await run(req);
    expect(req.user.id).toBe(5);
    expect(req.bearerExpired).toBe(true);
  });

  it('Bearer invalide + sans session : 401 Connexion requise', async () => {
    const req = { headers: { authorization: 'Bearer abc.def.ghi' }, session: {} };
    await expect(run(req)).rejects.toThrow(/Connexion requise/);
  });

  it('rejette sans session ni token', async () => {
    const req = { headers: {}, session: {} };
    await expect(run(req)).rejects.toThrow(/Connexion requise/);
  });

  it('accepte la session cookie en fallback', async () => {
    const req = { headers: {}, session: { user: { id: 3, role: 'admin' } } };
    await run(req);
    expect(req.user.role).toBe('admin');
  });

  it('refuse un compte bloqué même avec un token valide', async () => {
    isBlocked.mockResolvedValue(true);
    const req = bearer({ sub: 7, role: 'client' });
    await expect(run(req)).rejects.toThrow(/bloqué/);
  });

  it('refuse un compte bloqué sur une session existante', async () => {
    isBlocked.mockResolvedValue(true);
    const req = { headers: {}, session: { user: { id: 9, role: 'client' } } };
    await expect(run(req)).rejects.toThrow(/bloqué/);
  });

  it('refuse un compte suspendu avec un message dédié', async () => {
    isSuspended.mockResolvedValue(true);
    const req = bearer({ sub: 7, role: 'professional' });
    await expect(run(req)).rejects.toThrow(/suspendu/);
  });
});

describe('requireRole', () => {
  beforeEach(() => {
    isBlocked.mockResolvedValue(false);
    isSuspended.mockResolvedValue(false);
  });

  function runRole(mw, req) {
    return new Promise((resolve, reject) => {
      mw(req, {}, (err) => (err ? reject(err) : resolve()));
    });
  }

  it('autorise le bon rôle via Bearer', async () => {
    const mw = requireRole('professional');
    await expect(runRole(mw, bearer({ sub: 1, role: 'professional' }))).resolves.toBeUndefined();
  });

  it('refuse un mauvais rôle (403)', async () => {
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'client' }))).rejects.toThrow(/Accès refusé/);
  });

  it('refuse un administrateur bloqué (fuite de privilèges)', async () => {
    isBlocked.mockResolvedValue(true);
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'admin' }))).rejects.toThrow(/bloqué/);
  });

  it('refuse un administrateur suspendu', async () => {
    isSuspended.mockResolvedValue(true);
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'admin' }))).rejects.toThrow(/suspendu/);
  });

  it('expose req.user à la route', async () => {
    const mw = requireRole('admin');
    const req = bearer({ sub: 42, role: 'admin' });
    await runRole(mw, req);
    expect(req.user).toEqual({ id: 42, role: 'admin' });
  });
});
