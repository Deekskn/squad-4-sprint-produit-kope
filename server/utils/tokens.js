import crypto from 'node:crypto';

function base64url(input) {
  return Buffer.from(input).toString('base64url');
}

function sign(data, secret) {
  return crypto.createHmac('sha256', secret).update(data).digest('base64url');
}

export function signToken(payload, secret, ttlSeconds) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + ttlSeconds }));
  return `${header}.${body}.${sign(`${header}.${body}`, secret)}`;
}

/**
 * `crypto.timingSafeEqual` lève une RangeError quand les deux tampons
 * n'ont pas la même longueur : une signature tronquée faisait donc remonter
 * une erreur inattendue au lieu d'un simple « signature invalide ».
 */
function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function parsePayload(body) {
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
    if (!payload || typeof payload !== 'object') throw new Error('corps invalide');
    return payload;
  } catch {
    throw new Error('Token illisible');
  }
}

export function verifyToken(token, secret) {
  if (typeof token !== 'string' || !token) throw new Error('Token manquant');
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('Token invalide');
  if (!safeEqual(signature, sign(`${header}.${body}`, secret))) throw new Error('Signature invalide');

  const payload = parsePayload(body);
  if (payload.exp && payload.exp * 1000 < Date.now()) throw new Error('Token expiré');

  return payload;
}
