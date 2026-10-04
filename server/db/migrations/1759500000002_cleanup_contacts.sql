-- Up Migration

-- Nettoyage des tables du workflow "demande de contact" (US-09/10/11/17 supprimees).
-- Le module backend contacts/ a ete retire : ces tables ne sont plus utilisees.
DROP TABLE IF EXISTS contact_requests;

DROP TYPE IF EXISTS request_status;

-- Down Migration

-- Les tables d'origine ne sont pas recreees : elles sont hors scope produit.
