import express from 'express';
import { env, isProduction } from './config/env.js';
import { sessionMiddleware } from './config/session.js';
import routes from './routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();
if (isProduction) app.set('trust proxy', 1);
app.use(express.json());
app.use('/uploads', express.static(env.UPLOAD_DIR, { maxAge: '7d' }));
app.use('/api', sessionMiddleware, routes);
app.use('/api', (req, res) => res.status(404).json({ message: 'Route introuvable' }));
app.use(errorHandler);

export default app;