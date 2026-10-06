const buckets = new Map();

// Nettoyage 
setInterval(() => {
  const now = Date.now();
  for (const [key, hits] of buckets) {
    const kept = hits.filter((t) => now - t < 15 * 60_000);
    if (kept.length === 0) buckets.delete(key);
    else buckets.set(key, kept);
  }
}, 60_000).unref?.();

export function rateLimit({ windowMs = 15 * 60_000, max = 20, key = 'default' } = {}) {
  return (req, res, next) => {
    const id = `${key}:${req.ip}`;
    const now = Date.now();
    const hits = (buckets.get(id) ?? []).filter((t) => now - t < windowMs);
    if (hits.length >= max) {
      res.set('Retry-After', String(Math.ceil(windowMs / 1000)));
      return res.status(429).json({ message: 'Trop de tentatives, réessayez plus tard' });
    }
    hits.push(now);
    buckets.set(id, hits);
    next();
  };
}
