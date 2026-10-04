import express from 'express';
import { env, isProduction } from './config/env.js';
import { sessionMiddleware } from './config/session.js';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

// Derrière un reverse proxy (Nginx, Railway…) : nécessaire pour le cookie "secure"
if (isProduction) app.set('trust proxy', 1);

app.use(express.json());

// Photos servies directement (noms uniques : cache long sans risque)
app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '7d' }));

// La session n'est chargée que pour l'API (pas pour les fichiers de Vite)
app.use('/api', sessionMiddleware, routes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Route introuvable' }));

app.use(errorHandler);

export default app;