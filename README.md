# KOPE : Squad 4 · Sprint Produit

Dépôt de travail de la Squad 4 dans le cadre du Sprint Produit Akieni Academy (Évaluation 2).

**KOPE** est une plateforme de mise en relation entre particuliers et artisans du bâtiment (plombier, électricien, maçon, menuisier) à Brazzaville.

🔗 **Démo en ligne :** [LIEN VERCEL]

> La version stable du projet se trouve sur la branche `main`. La branche `develop` est la branche de travail.

## Le problème

À Brazzaville, trouver un artisan fiable passe presque toujours par le bouche-à-oreille, sans garantie sur la compétence, la ponctualité ni la disponibilité. Les artisans compétents, eux, n'ont pas de vitrine pour se faire connaître et perdent des clients.

## La solution (MVP)

- **Côté artisan** : inscription, profil vitrine (métier, zones, description, photos de réalisations) et réception des demandes de contact.
- **Côté client** : recherche par métier et par zone, consultation de la fiche d'un professionnel, envoi d'une demande de contact, accès aux coordonnées.
- **Côté administration** : modération des profils et des avis.

Les fonctionnalités hors MVP (paiement, fil social, messagerie avancée) sont dans le backlog futur.

## Objectifs du Sprint

- Identifier un problème réel ;
- Comprendre les utilisateurs concernés ;
- Définir une solution adaptée ;
- Cadrer un MVP réalisable ;
- Rédiger les spécifications fonctionnelles ;
- Développer un produit fonctionnel ;
- Tester et valider le MVP ;
- Préparer la présentation finale et la stratégie marketing.

## Équipe

### Product et analyse

| Rôle | Membre | Responsabilités |
|---|---|---|
| Product Manager | Divin Penzamoy | Vision produit, priorisation, périmètre du MVP, validation du produit livré |
| Business Analyst | Raymond Jacquinot Fulbert Mavoungou | SPEC et FRD, critères d'acceptation et recette des epics E1 à E3 |
| Business Analyst | Biency Pea Engambe | Critères d'acceptation et recette des epics E4 à E6, suivi du backlog |

### Développement

| Rôle | Membre | User Stories / périmètre |
|---|---|---|
| Développeur Full Stack | Joseph Miere Onka | [À COMPLÉTER] |
| Développeur Full Stack | Prosper Kwon Gee | Aide & Assistance |
| Développeur Full Stack | Jizreel Salem Mouyedi Mbemba | [À COMPLÉTER] |
| Développeur Full Stack | Force Espoir Loemba Packa | [À COMPLÉTER] |
| Développeur Full Stack | Jude Airich Koy | US4 - US5 - US14 |
| Développeur Full Stack | Ndende Christ |  |

Le détail des User Stories et de leurs critères d'acceptation se trouve dans `docs/ba/`.

## Structure du dépôt

Le projet est un seul dépôt : l'API (`server/`) et l'interface (`src/`) partagent le même `package.json` à la racine.

```
.
├── public/                      Fichiers statiques
├── server/                      API (Node.js)
│   ├── config/                  Variables d'environnement, sessions
│   ├── db/
│   │   ├── migrations/          Création et évolution des tables
│   │   ├── seeds/               Données initiales (compte admin)
│   │   └── pool.js              Connexion à la base de données
│   ├── middlewares/             Gestion des erreurs, authentification, rôles, upload, validation
│   ├── modules/                 Un dossier par fonctionnalité
│   │   ├── admin/               Modération
│   │   ├── auth/                Inscription, connexion
│   │   ├── photos/              Photos de réalisations
│   │   ├── professionals/       Profils des artisans
│   │   ├── reference/           Métiers et zones
│   │   ├── reviews/             Avis et notes
│   │   └── search/              Recherche par métier et zone
│   ├── utils/                   Outils communs (pagination, téléphone, uploads...)
│   ├── app.js
│   ├── index.js
│   ├── routes.js
│   └── README.md                Documentation de l'API
├── src/                         Interface (React + Vite)
│   ├── assets/
│   ├── components/              Éléments réutilisables (form, layout, ui)
│   ├── features/                Un dossier par fonctionnalité (admin, auth, photos,
│   │                            professionals, reference, reviews, search)
│   ├── lib/                     Client API, constantes, utilitaires
│   ├── mocks/                   Données de démonstration
│   ├── pages/                   Pages générales (accueil, erreurs, tableau de bord)
│   ├── routes/                  Routage et routes protégées
│   ├── shared/                  Contextes et hooks partagés
│   ├── main.jsx
│   └── README.md                Documentation de l'interface
├── tests/                       Tests automatisés (Vitest)
├── docs/
│   ├── pm/                      Vision, persona, proposition de valeur
│   ├── ba/                      SPEC, FRD, User Stories, plan de recette
│   ├── marketing/               Positionnement, plan de lancement
│   └── scrum/                   Sprint Backlog, Daily, Review, Rétrospective
├── .env.example                 Modèle de configuration
├── CONTRIBUTING.md
└── README.md
```

Chaque module du serveur suit le même découpage : `routes` → `controller` → `service` → `repository`, avec un fichier `schemas` pour la validation des données.

## Installation et lancement

Prérequis : Node.js et npm.

```bash
git clone https://github.com/Deekskn/squad-4-sprint-produit-kope.git
cd squad-4-sprint-produit-kope
git checkout develop

npm install
cp .env.example .env
```

Renseigner ensuite les valeurs locales dans `.env`. **Ne jamais pousser le fichier `.env`** : il contient des secrets et le dépôt est public.

Base de données (migrations, compte administrateur) et lancement de l'API : voir [`server/README.md`](server/README.md).
Lancement de l'interface : voir [`src/README.md`](src/README.md).


## Organisation du travail

- `main` : version stable, livrée au jury.
- `develop` : branche de travail, branche par défaut.
- Aucun push direct sur ces deux branches : tout passe par une Pull Request relue et approuvée.

Pour chaque ticket Jira :

1. Créer une branche depuis `develop` : `feature/CLE-12-nom-court`
2. Commiter avec la clé du ticket : `feat(CLE-12): description courte`
3. Ouvrir une Pull Request vers `develop`
4. Un coéquipier relit et approuve, puis la PR est mergée

Le détail est dans [CONTRIBUTING.md](CONTRIBUTING.md).

## Données de test

Ce dépôt est public. Les données de démonstration (artisans, numéros de téléphone, avis) sont fictives.
