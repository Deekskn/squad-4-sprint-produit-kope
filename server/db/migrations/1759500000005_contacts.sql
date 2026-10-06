-- Up Migration

-- Contacts : un utilisateur (client ou professionnel) contacte un autre utilisateur.
-- Le champ `outgoing` est calculé côté API : la table ne distingue pas les deux sens.
CREATE TYPE contact_status AS ENUM ('new', 'seen', 'done');

CREATE TABLE contacts (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sender_id    bigint      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id bigint      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message      text        NOT NULL CHECK (char_length(message) BETWEEN 10 AND 500),
  status       contact_status NOT NULL DEFAULT 'new',
  created_at   timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT contacts_no_self CHECK (sender_id <> recipient_id),
  CONSTRAINT contacts_unique_pair UNIQUE (sender_id, recipient_id)
);

CREATE INDEX ON contacts (recipient_id, created_at DESC);
CREATE INDEX ON contacts (sender_id, created_at DESC);

-- Down Migration

DROP TABLE contacts;
DROP TYPE contact_status;
