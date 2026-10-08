import ViteExpress from 'vite-express';
import app from './app.js';
import { env } from './config/env.js';
ViteExpress.listen(app, env.PORT, () => (
  console.log(`server running on http://localhost:${env.PORT}`)
));
