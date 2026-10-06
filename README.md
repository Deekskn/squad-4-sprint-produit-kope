# KOP Platform - Monorepo : Fullstack Application

Application fullstack de mise en relation avec des artisans. Le projet utilise une architecture monolithique moderne intégrant Express 5 et React 19 dans un même runtime via `vite-express`.

> **Scope MVP** : US-01 → US-16, plus la prise de contact (US-17) réintroduite : un client comme un professionnel peut contacter un autre utilisateur, et « Mes contacts » liste les deux sens. Sont **hors scope** : US-09, US-10, US-11 et US-18 (Could, hors sprint). Détail : `AGENT.md` §1.

---

## Tech Stack

- **Backend:** Node.js, Express v5, Vanilla SQL (PostgreSQL), Zod
- **Frontend:** React v19, Vite v8, Tailwind CSS v4, React Compiler (`babel-plugin-react-compiler`)
- **Integration:** `vite-express` (sert le HMR Vite en dev et les assets statiques en prod)
- **Quality & Tooling:** Vitest, ESLint v10, Prettier, Husky, Lint-Staged

---

## Project Structure

```text
├── public/              # Assets statiques globaux
├── server/              # Backend (Express 5, DB, Modules, API)
│   ├── config/          # Configurations d'environnement & session
│   ├── db/              # Pool PostgreSQL, migrations SQL & seeds
│   ├── middlewares/     # Auth, Zod validation, error handling
│   ├── modules/         # Modules métier isolés (Epics)
│   ├── utils/           # Helpers & classes d'erreurs
│   ├── app.js           # Configuration Express
│   ├── index.js         # Entrypoint HTTP (ViteExpress)
│   └── routes.js        # Assemblage des routes d'API
├── src/                 # Frontend (React 19)
├── tests/               # Suites de tests automatisés (Vitest)
├── .env.example         # Template des variables d'environnement
├── eslint.config.js     # Configuration Linter
├── vite.config.js       # Configuration Vite & plugins
└── package.json         # Dépendances & scripts globaux
```

---

## Prerequisites

- **Node.js:** `>=18.0.0`
- **Package Manager:** `npm` ou `bun` (un fichier `bun.lock` est présent)
- **Database:** PostgreSQL (local, Docker, ou service Cloud)

---

## Quickstart

### 1. Installation

```bash
npm install
```

### 2. Variables d'environnement

Copiez le template d'environnement à la racine :

```bash
cp .env.example .env
```

Ajustez vos identifiants PostgreSQL et secrets dans le fichier `.env`.

### 3. Base de données & Migrations

```bash
# Appliquer les migrations
npm run migrate:up

# Seeder les données initiales
npm run seed:admin
```

### 4. Lancement en Développement

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:3000` avec le serveur de dev Vite et le HMR React directement connectés au backend Express.

---

## NPM Scripts

| Commande | Description |
| :--- | :--- |
| `npm run dev` | Démarre le serveur backend + Vite HMR via Nodemon (`server/index.js`) |
| `npm run build` | Compile l'application React avec Vite pour la production |
| `npm run start` | Exécute l'application compilée en environnement de production |
| `npm run test` | Exécute la suite de tests unitaires/intégration via Vitest |
| `npx vitest run` | Variante CI : une seule passe, sans watch |
| `npm run lint` | Lance la vérification ESLint sur tout le projet |
| `npm run format` | Applique le formatage Prettier |
| `npm run prepare` | Initialise les hooks Husky pour la qualité de code |

---

## Code Quality & Commit Standards

Ce projet utilise **Husky** et **lint-staged**. À chaque commit, ESLint et Prettier vérifient automatiquement les fichiers modifiés pour garantir un code propre et homogène dans tout le dépôt.