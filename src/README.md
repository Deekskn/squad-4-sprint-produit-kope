# Frontend Architecture (React 19 + Vite)

Documentation du client frontend intégré via React 19, Tailwind CSS v4 et Vite.

---

## Tech Stack & Optimization

- **React 19:** Utilisation des nouveaux hooks et patterns modernes.
- **React Compiler:** Intégré via `babel-plugin-react-compiler`. Il mémoïse automatiquement les composants et valeurs, réduisant le besoin de `useMemo` / `useCallback` manuels.
- **Tailwind CSS v4:** Importation et configuration directe via `@tailwindcss/vite`.
- **ViteExpress:** L'application client est servie sur le même port que l'API Express en développement comme en production, évitant les problèmes de CORS.

---

## Recommended Client Structure

```text
src/
├── assets/          # Images, icônes SVG, polices
├── components/      # Composants UI réutilisables (Boutons, Inputs, Modales)
├── features/        # Composants et états regroupés par fonctionnalité/page
├── hooks/           # Custom React Hooks
├── services/        # Clients API & appels fetch vers /api/*
├── styles/          # Fichiers CSS globaux & directives Tailwind
├── App.jsx          # Composant Racine & Routing
└── main.jsx         # Point d'entrée React DOM
```

---

## API Calls & Routing

Puisque le frontend et le backend partagent la même origine grâce à `vite-express`, tous les appels d'API vers le serveur doivent utiliser des chemins relatifs :

```javascript
// Exemple d'appel API propre
const response = await fetch('/api/professionals');
const data = await response.json();
```

---

## Styling Convention

Ce projet utilise **Tailwind CSS v4**. Privilégiez les classes utilitaires directement dans vos éléments JSX et découpez en composants réutilisables dans `src/components/` lorsque des motifs d'interface se répètent.