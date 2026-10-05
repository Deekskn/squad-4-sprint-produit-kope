import crypto from 'node:crypto';
import { pool } from '../../db/pool.js';

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function store({ userId, token, expiresInSeconds }, db = pool) {
  const tokenHash = hashToken(token);
  await db.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, now() + ($3 || ' seconds')::interval)`,
    [userId, tokenHash, String(expiresInSeconds)],
  );
}

export async function findActiveByToken(token, db = pool) {
  const { rows } = await db.query(
    `SELECT id, user_id AS "userId", expires_at AS "expiresAt", revoked_at AS "revokedAt"
       FROM refresh_tokens
      WHERE token_hash = $1`,
    [hashToken(token)],
  );
  const row = rows[0];
  if (!row || row.revokedAt) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) return null;
  return row;
}

export async function revoke(token, db = pool) {
  await db.query(
    `UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`,
    [hashToken(token)],
  );
}

export async function revokeAllForUser(userId, db = pool) {
  await db.query(`UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL`, [userId]);
}
