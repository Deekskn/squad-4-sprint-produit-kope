import { pool } from '../../db/pool.js';

// `db` = pool par défaut, ou le client d'une transaction (withTransaction).

export async function updateRole(userId, role, db = pool) {
  await db.query('UPDATE users SET role = $2 WHERE id = $1', [userId, role]);
}

export async function findByPhone(phone, db = pool) {
  const { rows } = await db.query(
    `SELECT id, role, phone, password_hash AS "passwordHash",
            first_name AS "firstName", last_name AS "lastName"
       FROM users
      WHERE phone = $1`,
    [phone],
  );
  return rows[0] ?? null;
}

export async function findById(id, db = pool) {
  const { rows } = await db.query(
    `SELECT u.id, u.role, u.phone,
            u.first_name AS "firstName", u.last_name AS "lastName",
            p.display_name AS "displayName"
       FROM users u
       LEFT JOIN professionals p ON p.user_id = u.id
      WHERE u.id = $1`,
    [id],
  );
  return rows[0] ?? null;
}

export async function createUser({ role, phone, passwordHash, firstName = null, lastName = null }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO users (role, phone, password_hash, first_name, last_name, consented_at)
     VALUES ($1, $2, $3, $4, $5, now())
     RETURNING id, role, phone, first_name AS "firstName", last_name AS "lastName"`,
    [role, phone, passwordHash, firstName, lastName],
  );
  return rows[0];
}
