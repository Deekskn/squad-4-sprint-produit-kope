import { pool } from '../../db/pool.js';

export async function listProfessionals({ limit, offset }, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.name AS trade,
            u.phone,
            CASE WHEN p.is_hidden THEN 'hidden'
                 WHEN v.user_id IS NOT NULL THEN 'published'
                 ELSE 'incomplete' END AS status,
            COUNT(*) OVER()::int AS total
       FROM professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
       LEFT JOIN published_professionals v ON v.user_id = p.user_id
      ORDER BY p.display_name, p.user_id
      LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
}

export async function setProfessionalHidden(id, hidden, db = pool) {
  const { rowCount } = await db.query('UPDATE professionals SET is_hidden = $2 WHERE user_id = $1', [id, hidden]);
  return rowCount > 0;
}

export async function listReviews({ limit, offset }, db = pool) {
  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.is_hidden AS "isHidden", r.created_at AS "createdAt",
            u.first_name || ' ' || u.last_name AS "authorName",
            p.user_id AS "professionalId",
            p.display_name AS "professionalName",
            COUNT(*) OVER()::int AS total
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       JOIN professionals p ON p.user_id = r.professional_id
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $1 OFFSET $2`,
    [limit, offset],
  );
  return rows;
}

export async function setReviewHidden(id, hidden, db = pool) {
  const { rowCount } = await db.query('UPDATE reviews SET is_hidden = $2 WHERE id = $1', [id, hidden]);
  return rowCount > 0;
}
