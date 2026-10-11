import { consumeRateLimitSlot, purgeRateLimits, rateLimitTableExists } from '../utils/rateLimitStore.js';

/** Repli mémoire : utilisé si RATE_LIMIT_STORE=memory ou si la table n'est pas migrée. */
const buckets = new Map();

const CLEANUP_MS = 15 * 60_000;

setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    const kept = hits.filter((t) => now - t < CLEANUP_MS);
    if (kept.length === 0) buckets.delete(key);
    else buckets.set(key, kept);
  }
}, 60_000).unref?.();

let store = null;
let checked = false;

/** Résout le store une fois pour le process, en tolérant l'absence de la table. */
async function resolveStore() {
  if (checked) return store;
  checked = true;

  if (process.env.RATE_LIMIT_STORE === 'memory') {
    store = 'memory';
    console.warn('[rate-limit] RATE_LIMIT_STORE=memory : limite ineffective en déploiement serverless');
    return store;
  }

  store = (await rateLimitTableExists()) ? 'postgres' : 'memory';
  if (store === 'memory')
    console.warn('[rate-limit] table rate_limits absente : repli mémoire (npm run migrate:up)');
  return store;
}

// Balayage horaire des compteurs expirés.
setInterval(() => {
  if (store === 'postgres') purgeRateLimits().catch(() => {});
}, 60 * 60_000).unref?.();

function consumeInMemory(id, windowMs, max) {
  const now = Date.now();
  const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) return false;
  hits.push(now);
  buckets.set(id, hits);
  return true;
}

/** Vrai si la tentative est autorisée, en base si possible, en mémoire sinon. */
async function isAllowed(id, windowMs, max) {
  if ((await resolveStore()) !== 'postgres') return consumeInMemory(id, windowMs, max);

  try {
    return (await consumeRateLimitSlot(id)) <= max;
  } catch {
    // Base indisponible : on ne bloque pas l'utilisateur pour autant.
    return consumeInMemory(id, windowMs, max);
  }
}

export function rateLimit({ windowMs = 15 * 60_000, max = 20, key = 'default' } = {}) {
  return async (req, res, next) => {
    const allowed = await isAllowed(`${key}:${req.ip}`, windowMs, max);

    if (!allowed) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ message: 'Trop de tentatives, réessayez plus tard' });
    }
    return next();
  };
}