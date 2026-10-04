-- Up Migration

-- Accélère la liste paginée des avis publics dans l'ordre chronologique demandé par l'US-15.
CREATE INDEX reviews_visible_professional_created_idx
  ON reviews (professional_id, created_at DESC, id DESC)
  WHERE NOT is_hidden;

-- Down Migration

DROP INDEX reviews_visible_professional_created_idx;
