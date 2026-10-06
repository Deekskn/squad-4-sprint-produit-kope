import { pool } from '../../db/pool.js';
export async function searchPublished({ tradeId, zoneId, limit, offset }, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.name AS trade,
            p.years_experience AS "yearsExperience",
            p.is_available AS "isAvailable",
            ROUND(AVG(r.rating), 1)::float8 AS "ratingAverage",
            COUNT(r.id)::int AS "ratingCount",
            (SELECT ph.thumb_path FROM photos ph
              WHERE ph.professional_id = p.user_id
              ORDER BY ph.created_at, ph.id LIMIT 1) AS "coverThumb",
            COALESCE(
              (SELECT json_agg(z.name ORDER BY z.name)
                 FROM professional_zones pz
                 JOIN zones z ON z.id = pz.zone_id
                WHERE pz.professional_id = p.user_id),
              '[]'::json) AS zones,
            COUNT(*) OVER()::int AS total
       FROM published_professionals p
       JOIN trades t ON t.id = p.trade_id
       LEFT JOIN reviews r ON r.professional_id = p.user_id AND NOT r.is_hidden
      WHERE p.trade_id = $1
        AND ($2::smallint IS NULL
             OR EXISTS (SELECT 1 FROM professional_zones pz
                         WHERE pz.professional_id = p.user_id AND pz.zone_id = $2))
      GROUP BY p.user_id, p.display_name, p.years_experience, p.is_available, p.updated_at, t.name
      ORDER BY p.is_available DESC, "ratingAverage" DESC NULLS LAST, p.updated_at DESC, p.user_id
      LIMIT $3 OFFSET $4`,
    [tradeId, zoneId, limit, offset],
  );
  return rows;
}
