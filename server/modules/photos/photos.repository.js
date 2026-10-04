import { pool } from '../../db/pool.js';

const PHOTO_COLUMNS = `id, file_path AS "filePath", thumb_path AS "thumbPath", caption, created_at AS "createdAt"`;

export async function listByProfessional(professionalId, db = pool) {
  const { rows } = await db.query(
    `SELECT ${PHOTO_COLUMNS} FROM photos WHERE professional_id = $1 ORDER BY created_at, id`,
    [professionalId],
  );
  return rows;
}

export async function count(professionalId, db = pool) {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS count FROM photos WHERE professional_id = $1',
    [professionalId],
  );
  return rows[0].count;
}

export async function lockProfessional(professionalId, db = pool) {
  await db.query('SELECT 1 FROM professionals WHERE user_id = $1 FOR UPDATE', [professionalId]);
}

export async function create({ professionalId, filePath, thumbPath, caption }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO photos (professional_id, file_path, thumb_path, caption)
     VALUES ($1, $2, $3, $4)
     RETURNING ${PHOTO_COLUMNS}`,
    [professionalId, filePath, thumbPath, caption],
  );
  await touchProfile(professionalId, db);
  return rows[0];
}

export async function touchProfile(professionalId, db = pool) {
  await db.query('UPDATE professionals SET updated_at = now() WHERE user_id = $1', [professionalId]);
}

/** Supprime uniquement si la photo appartient à ce professionnel. */
export async function remove(photoId, professionalId, db = pool) {
  const { rows } = await db.query(
    `DELETE FROM photos
      WHERE id = $1 AND professional_id = $2
      RETURNING file_path AS "filePath", thumb_path AS "thumbPath"`,
    [photoId, professionalId],
  );
  if (rows[0]) await touchProfile(professionalId, db);
  return rows[0] ?? null;
}
