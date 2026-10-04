import pg from 'pg';
import { env } from '../config/env.js';

// Par défaut, pg renvoie les bigint (id, COUNT) sous forme de chaînes.
// On les convertit en nombres (sûr tant qu'on reste sous 2^53).
pg.types.setTypeParser(20, Number);

export const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

pool.on('error', (err) => {
  console.error('Erreur inattendue du pool Postgres', err);
});

/**
 * Exécute fn(client) dans une transaction.
 * Les repositories acceptent ce client en dernier argument (db = pool).
 */
export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
