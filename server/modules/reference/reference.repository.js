import { pool } from '../../db/pool.js';

export async function listTrades(db = pool) {
  const { rows } = await db.query('SELECT id, name FROM trades ORDER BY name');
  return rows;
}

export async function listZones(db = pool) {
  const { rows } = await db.query('SELECT id, name FROM zones ORDER BY name');
  return rows;
}
