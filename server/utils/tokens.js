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

export function verifyToken(token, secret) {
  if (typeof token !== 'string') throw new Error('Token manquant');
  const [header, body, signature] = token.split('.');
  if (!header || !body || !signature) throw new Error('Token invalide');
  const expected = sign(`${header}.${body}`, secret);
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    throw new Error('Signature invalide');
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString());
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error('Token expiré');
  }
  return payload;
}
