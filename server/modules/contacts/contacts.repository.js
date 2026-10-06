import { pool } from '../../db/pool.js';

const COUNTERPART = `
       FROM contacts c
       JOIN users u ON u.id = %s
       LEFT JOIN professionals p ON p.user_id = u.id
       LEFT JOIN trades t ON t.id = p.trade_id`;

const COUNTERPART_COLUMNS = `
            u.id AS "userId",
            u.role,
            u.phone,
            u.avatar_url AS "avatarUrl",
            u.first_name AS "firstName",
            u.last_name AS "lastName",
            COALESCE(
              p.display_name,
              NULLIF(BTRIM(COALESCE(u.first_name, '') || ' ' || COALESCE(u.last_name, '')), '')
            ) AS "displayName",
            t.name AS "tradeName"`;

export async function create({ senderId, recipientId, message }, db = pool) {
  const { rows } = await db.query(
    `INSERT INTO contacts (sender_id, recipient_id, message)
     VALUES ($1, $2, $3)
     RETURNING id, message, status, created_at AS "createdAt"`,
    [senderId, recipientId, message],
  );
  return rows[0];
}

export async function existsPair(senderId, recipientId, db = pool) {
  const { rowCount } = await db.query(
    'SELECT 1 FROM contacts WHERE sender_id = $1 AND recipient_id = $2',
    [senderId, recipientId],
  );
  return rowCount > 0;
}

/** Un contact déjà lu par son destinataire ne doit plus remonter comme "nouveau". */
export async function markIncomingAsSeen(userId, db = pool) {
  await db.query(
    "UPDATE contacts SET status = 'seen' WHERE recipient_id = $1 AND status = 'new'",
    [userId],
  );
}

/**
 * Tous mes contacts, dans les deux sens : ceux que j'ai contactés et ceux qui m'ont contacté.
 * `outgoing` indique le sens, le reste des colonnes décrit l'interlocuteur.
 */
export async function listForUser(userId, { limit = 20, offset = 0 } = {}, db = pool) {
  const outgoing = COUNTERPART.replace('%s', 'c.recipient_id');
  const incoming = COUNTERPART.replace('%s', 'c.sender_id');
  const { rows } = await db.query(
    `WITH mine AS (
       SELECT c.id, c.message, c.status, TRUE AS outgoing, c.created_at AS "createdAt",
              ${COUNTERPART_COLUMNS}
       ${outgoing}
      WHERE c.sender_id = $1
     UNION ALL
       SELECT c.id, c.message, c.status, FALSE AS outgoing, c.created_at AS "createdAt",
              ${COUNTERPART_COLUMNS}
       ${incoming}
      WHERE c.recipient_id = $1
     )
     SELECT *, COUNT(*) OVER()::int AS total
       FROM mine
      ORDER BY "createdAt" DESC, id DESC
      LIMIT $2 OFFSET $3`,
    [userId, limit, offset],
  );
  return rows;
}
