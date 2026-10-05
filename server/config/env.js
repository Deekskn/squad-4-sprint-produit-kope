import path from 'node:path';

// Node >= 20.12 : charge le fichier .env sans dépendance (dotenv inutile).
// Les variables déjà définies dans le système ne sont pas écrasées.
try {
  process.loadEnvFile();
} catch {
  // pas de fichier .env : on utilise les variables du système
}

const required = ['DATABASE_URL', 'SESSION_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);
}

const nodeEnv = process.env.NODE_ENV ?? 'development';

export const isProduction = nodeEnv === 'production';

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  // Cookie de session "secure" = envoyé uniquement en HTTPS. Mettre COOKIE_SECURE=false
  // pour tester `npm start` en local sans HTTPS.
  COOKIE_SECURE: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : isProduction,
  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR ?? 'uploads'),
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || process.env.SESSION_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || `${process.env.SESSION_SECRET}:refresh`,
  ACCESS_TOKEN_TTL: Number(process.env.ACCESS_TOKEN_TTL) || 3600, // 1h
  REFRESH_TOKEN_TTL: Number(process.env.REFRESH_TOKEN_TTL) || 86400, // 24h
  // Utilisés uniquement par `npm run seed:admin`
  ADMIN_PHONE: process.env.ADMIN_PHONE,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
};
