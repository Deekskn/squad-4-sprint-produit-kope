import { beforeAll, beforeEach, afterAll, describe, expect, it, vi } from 'vitest';

/**
 * Tests d'intégration HTTP : le vrai serveur Express est démarré sur un port
 * éphémère et interrogé en HTTP. Couvre la chaîne complète
 * route → middleware → validation Zod → service → repository, qui n'était
 * jamais exercée (aucun test ne sortait du HTTP).
 *
 * Seul le pool PostgreSQL est simulé : le SQL lui-même est déjà couvert
 * unitairement avec un faux `db.query` (tests/reviews-backend, admin-backend…).
 */

const STATS = {
  users: 42,
  clients: 20,
  professionals: 15,
  published: 9,
  hidden: 2,
  total: 15,
  reviews: 30,
  reviewsHidden: 1,
  ratingAverage: 4.2,
  contacts: 7,
};

/** État des comptes en base, indexé par id : chaque test décrit le compte qu'il utilise. */
const accountStates = new Map();
const activeAdmin = { role: 'admin', blockedAt: null, suspendedAt: null };

function fakePool() {
  return {
    on() {},
    async connect() {
      return { query: fakePool().query, release() {} };
    },
    async query(sql, params = []) {
      // Requêtes du store de session (connect-pg-simple) : aucune session active.
      if (/session/i.test(sql)) return { rows: [], rowCount: 0 };

      if (sql.includes('SELECT role, blocked_at')) {
        const state = accountStates.get(Number(params[0])) ?? activeAdmin;
        return { rows: [{ ...state }], rowCount: 1 };
      }

      if (sql.includes('FROM published_professionals') && sql.includes('AS "published"'))
        return { rows: [STATS], rowCount: 1 };
      if (sql.includes('display_name AS "displayName"') && sql.includes('ORDER BY u.created_at DESC'))
        return { rows: [], rowCount: 0 };
      if (sql.includes('SELECT 1 FROM published_professionals'))
        return { rowCount: 1, rows: [] };

      return { rows: [], rowCount: 0 };
    },
  };
}

vi.mock('../server/db/pool.js', () => {
  const pool = fakePool();
  return {
    pool,
    withTransaction: async (fn) => fn({ query: pool.query }),
  };
});

const { signToken } = await import('../server/utils/tokens.js');
const { env } = await import('../server/config/env.js');
const { default: app } = await import('../server/app.js');

let server;
let baseUrl;

const token = (payload, secret = env.ACCESS_TOKEN_SECRET) =>
  signToken(payload, secret, 3600);

beforeAll(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

afterAll(async () => {
  await new Promise((resolve) => server.close(resolve));
});

beforeEach(() => {
  accountStates.clear();
});

const get = (path, headers = {}) => fetch(`${baseUrl}${path}`, { headers });
const post = (path, body, headers = {}) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

describe('intégration HTTP', () => {
  describe('protection des routes admin', () => {
    it('refuse sans jeton', async () => {
      const res = await get('/api/admin/stats');
      expect(res.status).toBe(401);
    });

    it('refuse un client sur une route admin', async () => {
      accountStates.set(5, { role: 'client', blockedAt: null, suspendedAt: null });
      const res = await get('/api/admin/stats', { Authorization: `Bearer ${token({ sub: 5, role: 'client' })}` });
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toMatchObject({ message: 'Accès refusé' });
    });

    it('refuse un administrateur bloqué', async () => {
      accountStates.set(3, { role: 'admin', blockedAt: new Date(), suspendedAt: null });
      const res = await get('/api/admin/stats', { Authorization: `Bearer ${token({ sub: 3, role: 'admin' })}` });
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toMatchObject({ message: /bloqué/i });
    });

    it('refuse un administrateur suspendu', async () => {
      accountStates.set(4, { role: 'admin', blockedAt: null, suspendedAt: new Date() });
      const res = await get('/api/admin/stats', { Authorization: `Bearer ${token({ sub: 4, role: 'admin' })}` });
      expect(res.status).toBe(403);
      await expect(res.json()).resolves.toMatchObject({ message: /suspendu/i });
    });

    it('applique le rôle en base et non celui du token', async () => {
      // Token émis du temps où le compte était administrateur, puis rétrogradé.
      accountStates.set(6, { role: 'client', blockedAt: null, suspendedAt: null });
      const res = await get('/api/admin/stats', { Authorization: `Bearer ${token({ sub: 6, role: 'admin' })}` });
      expect(res.status).toBe(403);
    });

    it('accepte un administrateur et renvoie des statistiques exploitables', async () => {
      const res = await get('/api/admin/stats', { Authorization: `Bearer ${token({ sub: 1, role: 'admin' })}` });

      expect(res.status).toBe(200);
      const stats = await res.json();
      // countStats ne renvoie pas de clé `incomplete` : le calcul doit rester un nombre.
      expect(typeof stats.incomplete).toBe('number');
      expect(stats.incomplete).toBe(4);
      expect(stats.published).toBe(9);
      expect(stats.hidden).toBe(2);
    });

    it('envoie les en-têtes de sécurité', async () => {
      const res = await get('/api/admin/stats', { Authorization: `Bearer ${token({ sub: 1, role: 'admin' })}` });

      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('x-powered-by')).toBeNull();
    });
  });

  describe('validation des requêtes', () => {
    it('rejette un refreshToken de type invalide', async () => {
      const res = await post('/api/auth/refresh', { refreshToken: 42 });
      expect(res.status).toBe(400);
    });

    it('rejette un refreshToken absent', async () => {
      const res = await post('/api/auth/refresh', {});
      expect(res.status).toBe(401);
    });

    it('rejette un corps illisible sur une route authentifiée', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{ pas du json',
      });
      expect(res.status).toBeGreaterThanOrEqual(400);
      expect(res.status).toBeLessThan(500);
    });

    it('valide les paramètres de liste', async () => {
      const res = await get('/api/admin/professionals?page=0', {
        Authorization: `Bearer ${token({ sub: 1, role: 'admin' })}`,
      });
      expect(res.status).toBe(400);
    });
  });

  describe('routes inconnues', () => {
    it('renvoie un JSON explicite en 404', async () => {
      const res = await get('/api/inexistant');
      expect(res.status).toBe(404);
      await expect(res.json()).resolves.toEqual({ message: 'Route introuvable' });
    });
  });
});
