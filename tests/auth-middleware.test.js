import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requireAuth } from '../server/middlewares/requireAuth.js';
import { requireRole } from '../server/middlewares/requireRole.js';
import { signToken } from '../server/utils/tokens.js';

// requireAuth relit l'état du compte en base : on isole cette dépendance.
vi.mock('../server/modules/auth/auth.repository.js', () => ({
  getAccountState: vi.fn(),
}));

const { getAccountState } = await import('../server/modules/auth/auth.repository.js');

// requireAuth/requireRole utilisent env.ACCESS_TOKEN_SECRET - on génère le token avec le même env.
import { env } from '../server/config/env.js';

/** Compte actif par défaut ; chaque test surcharge ce qu'il lui faut. */
function account(overrides = {}) {
  return { role: 'client', blockedAt: null, suspendedAt: null, ...overrides };
}

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
    getAccountState.mockResolvedValue(account());
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
    getAccountState.mockResolvedValue(account({ role: 'admin' }));
    await run(req);
    expect(req.user.role).toBe('admin');
  });

  it('refuse un compte bloqué même avec un token valide', async () => {
    getAccountState.mockResolvedValue(account({ blockedAt: new Date() }));
    const req = bearer({ sub: 7, role: 'client' });
    await expect(run(req)).rejects.toThrow(/bloqué/);
  });

  it('refuse un compte bloqué sur une session existante', async () => {
    getAccountState.mockResolvedValue(account({ blockedAt: new Date() }));
    const req = { headers: {}, session: { user: { id: 9, role: 'client' } } };
    await expect(run(req)).rejects.toThrow(/bloqué/);
  });

  it('refuse un compte suspendu avec un message dédié', async () => {
    getAccountState.mockResolvedValue(account({ role: 'professional', suspendedAt: new Date() }));
    const req = bearer({ sub: 7, role: 'professional' });
    await expect(run(req)).rejects.toThrow(/suspendu/);
  });

  it('refuse un compte introuvable en base', async () => {
    getAccountState.mockResolvedValue(null);
    await expect(run(bearer({ sub: 7, role: 'client' }))).rejects.toThrow(/Connexion requise/);
  });
});

describe('requireRole', () => {
  beforeEach(() => {
    getAccountState.mockResolvedValue(account());
  });

  function runRole(mw, req) {
    return new Promise((resolve, reject) => {
      mw(req, {}, (err) => (err ? reject(err) : resolve()));
    });
  }

  it('autorise le bon rôle via Bearer', async () => {
    getAccountState.mockResolvedValue(account({ role: 'professional' }));
    const mw = requireRole('professional');
    await expect(runRole(mw, bearer({ sub: 1, role: 'professional' }))).resolves.toBeUndefined();
  });

  it('refuse un mauvais rôle (403)', async () => {
    getAccountState.mockResolvedValue(account({ role: 'client' }));
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'client' }))).rejects.toThrow(/Accès refusé/);
  });

  it('refuse un administrateur bloqué (fuite de privilèges)', async () => {
    getAccountState.mockResolvedValue(account({ role: 'admin', blockedAt: new Date() }));
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'admin' }))).rejects.toThrow(/bloqué/);
  });

  it('refuse un administrateur suspendu', async () => {
    getAccountState.mockResolvedValue(account({ role: 'admin', suspendedAt: new Date() }));
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'admin' }))).rejects.toThrow(/suspendu/);
  });

  it('expose req.user à la route', async () => {
    getAccountState.mockResolvedValue(account({ role: 'admin' }));
    const mw = requireRole('admin');
    const req = bearer({ sub: 42, role: 'admin' });
    await runRole(mw, req);
    expect(req.user).toEqual({ id: 42, role: 'admin' });
  });

  it('ignore un rôle périmé : le rôle en base fait foi', async () => {
    // Token émis alors que le compte était administrateur, rétrogradé depuis.
    getAccountState.mockResolvedValue(account({ role: 'client' }));
    const mw = requireRole('admin');
    await expect(runRole(mw, bearer({ sub: 1, role: 'admin' }))).rejects.toThrow(/Accès refusé/);
  });
});