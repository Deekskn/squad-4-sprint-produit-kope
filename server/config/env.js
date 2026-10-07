import path from 'node:path';
try {
  process.loadEnvFile();
} catch {
}

const required = ['DATABASE_URL', 'SESSION_SECRET'];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) 
  throw new Error(`Variables d'environnement manquantes : ${missing.join(', ')}`);


const nodeEnv = process.env.NODE_ENV ?? 'development';

export const isProduction = nodeEnv === 'production';

export const env = {
  NODE_ENV: nodeEnv,
  PORT: Number(process.env.PORT) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  SESSION_SECRET: process.env.SESSION_SECRET,
  COOKIE_SECURE: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === 'true'
    : isProduction,
  UPLOAD_DIR: path.resolve(process.env.UPLOAD_DIR ?? 'uploads'),
 ADMIN_PHONE: process.env.ADMIN_PHONE,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? process.env.SESSION_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? process.env.SESSION_SECRET,
  ACCESS_TOKEN_TTL: Number(process.env.ACCESS_TOKEN_TTL) || 3600,
  REFRESH_TOKEN_TTL: Number(process.env.REFRESH_TOKEN_TTL) || 86400,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  CLOUDINARY_FOLDER: process.env.CLOUDINARY_FOLDER ?? 'kope',
};
