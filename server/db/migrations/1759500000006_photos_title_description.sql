-- Up Migration

-- Photos : titre + description.
ALTER TABLE photos ADD COLUMN title varchar(100);
ALTER TABLE photos ADD COLUMN description varchar(500);

-- l'ancienne légende devient le titre.
UPDATE photos SET title = caption WHERE title IS NULL AND caption IS NOT NULL;

-- Down Migration

ALTER TABLE photos DROP COLUMN title;
ALTER TABLE photos DROP COLUMN description;
