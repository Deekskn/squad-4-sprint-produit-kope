import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const SIZE = 512;

/** Redimensionne à 512x512 en JPEG (contenu JPG/PNG vérifié par sharp). */
export async function processAvatar(buffer) {
  try {
    return await sharp(buffer).rotate().resize(SIZE, SIZE, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
  } catch {
    throw ApiError.badRequest("Le fichier n'est pas une image JPG ou PNG valide");
  }
}

/** Enregistre dans uploads/avatars, retourne le chemin relatif (pour l'URL publique). */
export async function saveAvatar(buffer, userId) {
  const dir = path.join(env.UPLOAD_DIR, 'avatars');
  await fs.mkdir(dir, { recursive: true });
  const filename = `${userId}-${randomUUID()}.jpg`;
  const relativePath = `avatars/${filename}`;
  await fs.writeFile(path.join(env.UPLOAD_DIR, relativePath), buffer);
  return relativePath;
}
