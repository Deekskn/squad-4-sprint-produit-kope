// Crée le compte administrateur directement en base (US-16 CA4 : pas d'inscription admin).
// Usage : renseigner ADMIN_PHONE et ADMIN_PASSWORD dans .env puis `npm run seed:admin`.
import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { pool } from '../pool.js';
import { normalizePhone } from '../../utils/phone.js';

async function main() {
  const phone = normalizePhone(env.ADMIN_PHONE ?? '');
  if (!phone || !env.ADMIN_PASSWORD || env.ADMIN_PASSWORD.length < 8) {
    throw new Error('ADMIN_PHONE (numéro valide) et ADMIN_PASSWORD (8 caractères min.) sont requis dans .env');
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
  const { rowCount } = await pool.query(
    `INSERT INTO users (role, phone, password_hash)
     VALUES ('admin', $1, $2)
     ON CONFLICT (phone) DO NOTHING`,
    [phone, passwordHash],
  );

  console.log(rowCount ? `Compte admin créé : ${phone}` : `Un compte existe déjà pour ${phone}, rien à faire`);
}

main()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
