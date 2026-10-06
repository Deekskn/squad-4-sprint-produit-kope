import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { env } from '../../config/env.js';
import { useCloud, uploadBuffer } from '../../config/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';

const SIZE = 512;

/* Redimensionne */
export async function processAvatar(buffer) {
  try {
    return await sharp(buffer).rotate().resize(SIZE, SIZE, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer();
  } catch {
    throw ApiError.badRequest("Le fichier n'est pas une image JPG ou PNG valide");
  }
}

/* Enregistre l'avatar */
export async function saveAvatar(buffer, userId) {
  const relativePath = `avatars/${userId}-${randomUUID()}.jpg`;

  if (useCloud) {
    await uploadBuffer(buffer, relativePath);
    return relativePath;
  }

  await fs.mkdir(path.join(env.UPLOAD_DIR, 'avatars'), { recursive: true });
  await fs.writeFile(path.join(env.UPLOAD_DIR, relativePath), buffer);
  return relativePath;
}