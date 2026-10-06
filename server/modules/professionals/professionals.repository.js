import { pool } from '../../db/pool.js';

const ZONES_JSON = `
  COALESCE(
    (SELECT json_agg(json_build_object('id', z.id, 'name', z.name) ORDER BY z.name)
       FROM professional_zones pz
       JOIN zones z ON z.id = pz.zone_id
      WHERE pz.professional_id = p.user_id),
    '[]'::json)`;

/** Appelé à l'inscription (auth.service) : profil créé vide, donc "Incomplet". */
export async function create({ userId, displayName, tradeId }, db = pool) {
  await db.query(
    'INSERT INTO professionals (user_id, display_name, trade_id) VALUES ($1, $2, $3)',
    [userId, displayName, tradeId],
  );
}

/** Remplace toutes les zones du professionnel (à appeler dans une transaction). */
export async function replaceZones(professionalId, zoneIds, db = pool) {
  await db.query('DELETE FROM professional_zones WHERE professional_id = $1', [professionalId]);
  await db.query(
    `INSERT INTO professional_zones (professional_id, zone_id)
     SELECT $1, unnest($2::smallint[])`,
    [professionalId, zoneIds],
  );
}

export async function tradeExists(tradeId, db = pool) {
  const { rowCount } = await db.query('SELECT 1 FROM trades WHERE id = $1', [tradeId]);
  return rowCount > 0;
}

export async function updateProfile(userId, { displayName, tradeId, description, yearsExperience, whatsapp }, db = pool) {
  await db.query(
    `UPDATE professionals
        SET display_name = $2, trade_id = $3, description = $4, years_experience = $5, whatsapp = $6, updated_at = now()
      WHERE user_id = $1`,
    [userId, displayName, tradeId, description, yearsExperience, whatsapp],
  );
}

export async function setAvailability(userId, isAvailable, db = pool) {
  await db.query('UPDATE professionals SET is_available = $2 WHERE user_id = $1', [userId, isAvailable]);
}

/** Profil du propriétaire, quel que soit son statut. */
export async function findOwnProfile(userId, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            u.phone,
            p.trade_id AS "tradeId",
            t.name AS "tradeName",
            p.description,
            p.years_experience AS "yearsExperience",
            COALESCE(p.whatsapp, u.phone) AS whatsapp,
            p.is_available AS "isAvailable",
            p.is_hidden AS "isHidden",
            EXISTS (SELECT 1 FROM published_professionals v WHERE v.user_id = p.user_id) AS "isPublished",
            (SELECT COUNT(*) FROM photos ph WHERE ph.professional_id = p.user_id)::int AS "photoCount",
            ${ZONES_JSON} AS zones
       FROM professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
      WHERE p.user_id = $1`,
    [userId],
  );
  return rows[0] ?? null;
}

export async function existsPublished(id, db = pool) {
  const { rowCount } = await db.query('SELECT 1 FROM published_professionals WHERE user_id = $1', [id]);
  return rowCount > 0;
}

export async function findPublishedDetail(id, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.id AS "tradeId",
            t.name AS trade,
            p.description,
            p.years_experience AS "yearsExperience",
            p.is_available AS "isAvailable",
            u.phone,
            COALESCE(p.whatsapp, u.phone) AS whatsapp,
            ${ZONES_JSON} AS zones
       FROM published_professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
      WHERE p.user_id = $1`,
    [id],
  );
  return rows[0] ?? null;
}
