import { pool } from '../../db/pool.js';

export async function listProfessionals({ limit, offset, q, status, sort }, db = pool) {
  const orderBy = sort === 'recent' ? 'u.created_at DESC, p.user_id DESC' : 'p.display_name, p.user_id';
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.name AS trade,
            u.phone,
            u.avatar_url AS "avatarUrl",
            u.created_at AS "createdAt",
            CASE WHEN p.is_hidden THEN 'hidden'
                 WHEN v.user_id IS NOT NULL THEN 'published'
                 ELSE 'incomplete' END AS status,
            COUNT(*) OVER()::int AS total
       FROM professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
       LEFT JOIN published_professionals v ON v.user_id = p.user_id
      WHERE ($1::text IS NULL
             OR p.display_name ILIKE '%' || $1 || '%'
             OR u.phone ILIKE '%' || $1 || '%')
        AND ($2::text IS NULL
             OR ($2 = 'hidden' AND p.is_hidden)
             OR ($2 = 'published' AND NOT p.is_hidden AND v.user_id IS NOT NULL)
             OR ($2 = 'incomplete' AND NOT p.is_hidden AND v.user_id IS NULL))
      ORDER BY ${orderBy}
      LIMIT $3 OFFSET $4`,
    [q ?? null, status ?? null, limit, offset],
  );
  return rows;
}

export async function setProfessionalHidden(id, hidden, db = pool) {
  const { rowCount } = await db.query('UPDATE professionals SET is_hidden = $2 WHERE user_id = $1', [id, hidden]);
  return rowCount > 0;
}

export async function listReviews({ limit, offset, hidden, q }, db = pool) {
  const { rows } = await db.query(
    `SELECT r.id, r.rating, r.comment, r.is_hidden AS "isHidden", r.created_at AS "createdAt",
            json_build_object(
              'id', c.id,
              'firstName', c.first_name,
              'lastName', c.last_name,
              'avatarUrl', c.avatar_url
            ) AS client,
            json_build_object('id', p.user_id, 'displayName', p.display_name) AS professional,
            COUNT(*) OVER()::int AS total
       FROM reviews r
       JOIN users u ON u.id = r.client_id
       JOIN professionals p ON p.user_id = r.professional_id
       LEFT JOIN users c ON c.id = r.client_id
      WHERE ($1::boolean IS NULL OR r.is_hidden = $1)
        AND ($2::text IS NULL
             OR u.first_name ILIKE '%' || $2 || '%'
             OR u.last_name ILIKE '%' || $2 || '%'
             OR p.display_name ILIKE '%' || $2 || '%'
             OR r.comment ILIKE '%' || $2 || '%')
      ORDER BY r.created_at DESC, r.id DESC
      LIMIT $3 OFFSET $4`,
    [typeof hidden === 'boolean' ? hidden : null, q ?? null, limit, offset],
  );
  return rows;
}

export async function setReviewHidden(id, hidden, db = pool) {
  const { rowCount } = await db.query('UPDATE reviews SET is_hidden = $2 WHERE id = $1', [id, hidden]);
  return rowCount > 0;
}

export async function listUsers({ limit, offset, role, q }, db = pool) {
  const { rows } = await db.query(
    `SELECT u.id, u.role, u.phone,
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            u.avatar_url AS "avatarUrl",
            u.created_at AS "createdAt",
            u.blocked_at AS "blockedAt",
            COUNT(*) OVER()::int AS total
       FROM users u
      WHERE ($1::text IS NULL OR u.role = $1)
        AND ($2::text IS NULL
             OR u.first_name ILIKE '%' || $2 || '%'
             OR u.last_name ILIKE '%' || $2 || '%'
             OR u.phone ILIKE '%' || $2 || '%')
      ORDER BY u.created_at DESC, u.id DESC
      LIMIT $3 OFFSET $4`,
    [role ?? null, q ?? null, limit, offset],
  );
  return rows;
}

export async function countStats(db = pool) {
  const { rows } = await db.query(
    `SELECT
        (SELECT COUNT(*)::int FROM users) AS "users",
        (SELECT COUNT(*)::int FROM users WHERE role = 'client') AS "clients",
        (SELECT COUNT(*)::int FROM users WHERE role = 'professional') AS "professionals",
        (SELECT COUNT(*)::int FROM professionals WHERE NOT is_hidden AND description IS NOT NULL
            AND years_experience IS NOT NULL
            AND EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = professionals.user_id)
            AND EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = professionals.user_id)) AS "published",
        (SELECT COUNT(*)::int FROM professionals WHERE is_hidden) AS "hidden",
        (SELECT COUNT(*)::int FROM professionals) AS "total",
        (SELECT COUNT(*)::int FROM reviews) AS "reviews",
        (SELECT COUNT(*)::int FROM reviews WHERE is_hidden) AS "reviewsHidden",
        (SELECT COALESCE(ROUND(AVG(rating), 1)::float8, 0) FROM reviews WHERE NOT is_hidden) AS "ratingAverage",
        (SELECT COUNT(*)::int FROM contact_requests) AS "contacts"`,
  );
  return rows[0];
}

export async function listRecentProfessionals(limit = 5, db = pool) {
  const { rows } = await db.query(
    `SELECT p.user_id AS id,
            p.display_name AS "displayName",
            t.name AS trade,
            u.created_at AS "createdAt"
       FROM professionals p
       JOIN users u ON u.id = p.user_id
       JOIN trades t ON t.id = p.trade_id
      ORDER BY u.created_at DESC, p.user_id DESC
      LIMIT $1`,
    [limit],
  );
  return rows;
}

export async function findUserById(id, db = pool) {
  const { rows } = await db.query('SELECT id, role, blocked_at AS "blockedAt" FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function setUserBlocked(id, blocked, db = pool) {
  const { rows } = await db.query(
    `UPDATE users
        SET blocked_at = CASE WHEN $2::boolean THEN now() ELSE NULL END
      WHERE id = $1
      RETURNING id, role, phone, blocked_at AS "blockedAt"`,
    [id, blocked],
  );
  return rows[0] ?? null;
}

export async function countActiveAdmins(excludeId, db = pool) {
  const { rows } = await db.query(
    `SELECT COUNT(*)::int AS count
       FROM users
      WHERE role = 'admin'
        AND blocked_at IS NULL
        AND id <> $1`,
    [excludeId],
  );
  return rows[0].count;
}

export async function createAdminUser({ firstName, lastName, phone, passwordHash }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO users (role, phone, password_hash, first_name, last_name, consented_at)
     VALUES ('admin', $1, $2, $3, $4, now())
     RETURNING id, role, phone, first_name AS "firstName", last_name AS "lastName", created_at AS "createdAt"`,
    [phone, passwordHash, firstName, lastName],
  );
  return rows[0];
}

export async function listTrades(db = pool) {
  const { rows } = await db.query(
    `SELECT t.id, t.name, t.category_id AS "categoryId", c.name AS category,
            t.created_at AS "createdAt", COUNT(p.user_id)::int AS "professionals"
       FROM trades t
       LEFT JOIN trade_categories c ON c.id = t.category_id
       LEFT JOIN professionals p ON p.trade_id = t.id
      GROUP BY t.id, t.name, t.category_id, c.name, t.sort_order, t.created_at
      ORDER BY c.sort_order NULLS LAST, t.sort_order, t.name`,
  );
  return rows;
}

export async function listTradeCategories(db = pool) {
  const { rows } = await db.query(
    `SELECT c.id, c.name, COUNT(t.id)::int AS "trades"
       FROM trade_categories c
       LEFT JOIN trades t ON t.category_id = c.id
      GROUP BY c.id, c.name, c.sort_order
      ORDER BY c.sort_order, c.name`,
  );
  return rows;
}

export async function createTradeCategory(name, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO trade_categories (name, sort_order)
     VALUES ($1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM trade_categories))
     RETURNING id, name`,
    [name],
  );
  return rows[0];
}

export async function updateTradeCategory(id, name, db = pool) {
  const { rows } = await db.query(
    'UPDATE trade_categories SET name = $2 WHERE id = $1 RETURNING id, name',
    [id, name],
  );
  return rows[0] ?? null;
}

export async function deleteTradeCategory(id, db = pool) {
  const { rowCount } = await db.query('DELETE FROM trade_categories WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function reorderTradeCategories(ids, db = pool) {
  await db.query(
    `UPDATE trade_categories AS c SET sort_order = u.ord::int
       FROM unnest($1::int[]) WITH ORDINALITY AS u(id, ord)
      WHERE c.id = u.id`,
    [ids],
  );
}

export async function tradeCategoryInUse(id, db = pool) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM trades WHERE category_id = $1', [id]);
  return rows[0].count > 0;
}

export async function createTrade(name, categoryId, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO trades (name, category_id, sort_order)
     VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM trades))
     RETURNING id, name, category_id AS "categoryId"`,
    [name, categoryId ?? null],
  );
  return rows[0];
}

export async function updateTrade(id, name, categoryId, db = pool) {
  const { rows } = await db.query(
    'UPDATE trades SET name = $2, category_id = $3 WHERE id = $1 RETURNING id, name, category_id AS "categoryId"',
    [id, name, categoryId ?? null],
  );
  return rows[0] ?? null;
}

export async function deleteTrade(id, db = pool) {
  const { rowCount } = await db.query('DELETE FROM trades WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function reorderTrades(ids, db = pool) {
  await db.query(
    `UPDATE trades AS t SET sort_order = u.ord::int
       FROM unnest($1::int[]) WITH ORDINALITY AS u(id, ord)
      WHERE t.id = u.id`,
    [ids],
  );
}

export async function tradeInUse(id, db = pool) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM professionals WHERE trade_id = $1', [id]);
  return rows[0].count > 0;
}

export async function listZones(db = pool) {
  const { rows } = await db.query(
    `SELECT z.id, z.name, z.city_id AS "cityId", c.name AS city,
            z.created_at AS "createdAt",
            COUNT(pz.professional_id)::int AS "professionals"
       FROM zones z
       LEFT JOIN cities c ON c.id = z.city_id
       LEFT JOIN professional_zones pz ON pz.zone_id = z.id
      GROUP BY z.id, z.name, z.city_id, c.name, z.sort_order, z.created_at
      ORDER BY c.sort_order NULLS LAST, z.sort_order, z.name`,
  );
  return rows;
}

export async function listCities(db = pool) {
  const { rows } = await db.query(
    `SELECT c.id, c.name, COUNT(z.id)::int AS zones
       FROM cities c
       LEFT JOIN zones z ON z.city_id = c.id
      GROUP BY c.id, c.name, c.sort_order
      ORDER BY c.sort_order, c.name`,
  );
  return rows;
}

export async function createCity(name, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO cities (name, sort_order)
     VALUES ($1, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM cities))
     RETURNING id, name`,
    [name],
  );
  return rows[0];
}

export async function updateCity(id, name, db = pool) {
  const { rows } = await db.query('UPDATE cities SET name = $2 WHERE id = $1 RETURNING id, name', [id, name]);
  return rows[0] ?? null;
}

export async function deleteCity(id, db = pool) {
  const { rowCount } = await db.query('DELETE FROM cities WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function reorderCities(ids, db = pool) {
  await db.query(
    `UPDATE cities AS c SET sort_order = u.ord::int
       FROM unnest($1::int[]) WITH ORDINALITY AS u(id, ord)
      WHERE c.id = u.id`,
    [ids],
  );
}

export async function cityInUse(id, db = pool) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM zones WHERE city_id = $1', [id]);
  return rows[0].count > 0;
}

export async function createZone(name, cityId, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO zones (name, city_id, sort_order)
     VALUES ($1, $2, (SELECT COALESCE(MAX(sort_order), 0) + 1 FROM zones))
     RETURNING id, name, city_id AS "cityId"`,
    [name, cityId ?? null],
  );
  return rows[0];
}

export async function updateZone(id, name, cityId, db = pool) {
  const { rows } = await db.query(
    'UPDATE zones SET name = $2, city_id = $3 WHERE id = $1 RETURNING id, name, city_id AS "cityId"',
    [id, name, cityId ?? null],
  );
  return rows[0] ?? null;
}

export async function deleteZone(id, db = pool) {
  const { rowCount } = await db.query('DELETE FROM zones WHERE id = $1', [id]);
  return rowCount > 0;
}

export async function reorderZones(ids, db = pool) {
  await db.query(
    `UPDATE zones AS z SET sort_order = u.ord::int
       FROM unnest($1::int[]) WITH ORDINALITY AS u(id, ord)
      WHERE z.id = u.id`,
    [ids],
  );
  return true;
}

export async function zoneInUse(id, db = pool) {
  const { rows } = await db.query('SELECT COUNT(*)::int AS count FROM professional_zones WHERE zone_id = $1', [id]);
  return rows[0].count > 0;
}
