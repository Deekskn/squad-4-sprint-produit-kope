-- Up Migration

ALTER TABLE users ADD COLUMN avatar_url text;

-- Down Migration

ALTER TABLE users DROP COLUMN avatar_url;
