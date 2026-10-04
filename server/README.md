# Server Architecture & API Guidelines

Documentation technique du backend Express 5 et des règles d'ingénierie logicielle appliquées.

---

## Architecture Modulaire (Domain-Driven / Epics)

Le backend est découpé en modules métier autonomes situés dans `server/modules/`. Chaque module gère l'intégralité d'un domaine (Epic).

```text
server/modules/<epic_name>/
├── <epic>.routes.js      # Déclaration des endpoints HTTP
├── <epic>.controller.js  # Extraction des données et réponse HTTP
├── <epic>.service.js     # Logique métier & transactions DB
├── <epic>.repository.js  # Requêtes SQL paramétrées (pg)
└── <epic>.schemas.js     # Schémas de validation Zod
```

---

## Responsabilités des Couches

- **Controllers:** Ne contiennent **aucune règle métier**. Ils lisent exclusivement `req.validated` (injecté par les middlewares Zod), appellent le service approprié et renvoient le résultat HTTP.
- **Services:** Contiennent les règles métiers, l'orchestration, la gestion des transactions (`withTransaction`) et la levée d'erreurs applicatives (`ApiError`). **Interdiction d'écrire du SQL ici**.
- **Repositories:** Exécutent le SQL pur via le driver `pg`. Requêtes strictement **paramétrées** (`$1`, `$2`...).
- **Routes:** Exposent les chemins d'accès et attachent les middlewares de sécurité (`requireAuth`, `requireRole`) et de validation Zod.

---

## Isolation & Règles de Dépendance Inter-Modules

Pour éviter tout couplage fort et dépendance circulaire :

1. **Controllers :** Interdit d'importer le controller d'un autre module.
2. **Services :** Autorisé de consommer les services d'un autre domaine si nécessaire (ex: `professionals.service` peut appeler `photos.service`).
3. **Repositories :** Les repositories peuvent être consommés par d'autres modules pour de l'agrégation de données.

---

## Errors & Exception Handling

Express 5 capture automatiquement les promesses rejetées. Lancez simplement une instance `ApiError` depuis vos services :

```javascript
import { ApiError } from '../utils/ApiError.js';

// Exemples
throw ApiError.notFound('Professionnel introuvable');
throw ApiError.unauthorized('Session expirée');
throw ApiError.badRequest('Données invalides');
```

Le middleware `errorHandler.js` intercepte ces erreurs centralisées et formate une réponse JSON standardisée.

## Base de données et US-12

La configuration locale est chargée depuis `.env` à la racine du dépôt. Renseignez `DATABASE_URL` et `SESSION_SECRET` à partir de `.env.example`, puis appliquez les migrations depuis la racine :

```sh
npm run migrate:up
```

La disponibilité est stockée dans `professionals.is_available`, colonne `BOOLEAN NOT NULL DEFAULT true` créée avec la table `professionals` par `server/db/migrations/1759500000000_init.sql`. La valeur est modifiée par `PATCH /api/me/availability`; cette route exige une session avec le rôle `professional` et valide le booléen `isAvailable`. Les profils publics et les résultats de recherche exposent ce champ sans exclure les professionnels indisponibles.

Après une installation ou une mise à jour du schéma, vérifiez l’état des migrations avec `npm run migrate:up`. Les tests d’acceptation frontend et backend de l’US-12 sont dans `tests/us12-availability.test.jsx` et s’exécutent avec `npm test -- --run`.