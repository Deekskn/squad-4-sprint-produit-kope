-- Up Migration

CREATE OR REPLACE VIEW published_professionals AS
SELECT p.user_id, p.display_name, p.trade_id, p.description, p.years_experience,
       p.whatsapp, p.is_available, p.updated_at
  FROM professionals p
  JOIN users u ON u.id = p.user_id
  JOIN trades t ON t.id = p.trade_id
 WHERE NOT p.is_hidden
   AND char_length(btrim(p.display_name)) > 0
   AND char_length(btrim(t.name)) > 0
   AND EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id)
   AND char_length(btrim(u.phone)) > 0
   AND char_length(btrim(p.description)) >= 30
   AND EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id);

-- Down Migration

CREATE OR REPLACE VIEW published_professionals AS
SELECT p.user_id, p.display_name, p.trade_id, p.description, p.years_experience,
       p.whatsapp, p.is_available, p.updated_at
  FROM professionals p
 WHERE NOT p.is_hidden
   AND p.description IS NOT NULL
   AND p.years_experience IS NOT NULL
   AND EXISTS (SELECT 1 FROM professional_zones z WHERE z.professional_id = p.user_id)
   AND EXISTS (SELECT 1 FROM photos ph WHERE ph.professional_id = p.user_id);
