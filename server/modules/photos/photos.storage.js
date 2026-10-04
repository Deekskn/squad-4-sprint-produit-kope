import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { env } from '../../config/env.js';
import { ApiError } from '../../utils/ApiError.js';

const MAIN_WIDTH = 1280; // US-05 CA5
const THUMB_WIDTH = 400;
const INVALID_IMAGE = "Le fichier n'est pas une image JPG ou PNG valide";

/**
 * Vérifie que le contenu est vraiment un JPG/PNG (le type MIME envoyé par le navigateur
 * ne suffit pas), applique l'orientation EXIF (photos de téléphone), redimensionne à
 * 1280 px max de large et génère une miniature de 400 px. Sortie en JPEG.
 */
export async function processImage(buffer) {
  try {
    const { format } = await sharp(buffer).metadata();
    if (format !== 'jpeg' && format !== 'png') throw new Error('format non supporté');

    const base = sharp(buffer).rotate().flatten({ background: '#ffffff' }); // PNG transparent -> fond blanc
    const [main, thumb] = await Promise.all([
      base.clone().resize({ width: MAIN_WIDTH, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer(),
      base.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer(),
    ]);
    return { main, thumb };
  } catch {
    throw ApiError.badRequest(INVALID_IMAGE, { photo: INVALID_IMAGE });
  }
}

/** Chemins relatifs (stockés en base) : <idProfessionnel>/<uuid>.jpg et <uuid>_thumb.jpg */
export function newPaths(professionalId) {
  const name = randomUUID();
  return {
    filePath: `${professionalId}/${name}.jpg`,
    thumbPath: `${professionalId}/${name}_thumb.jpg`,
  };
}

const absolute = (relativePath) => path.join(env.UPLOAD_DIR, relativePath);

export async function save({ filePath, thumbPath }, { main, thumb }) {
  try {
    await fs.mkdir(path.dirname(absolute(filePath)), { recursive: true });
    await fs.writeFile(absolute(filePath), main);
    await fs.writeFile(absolute(thumbPath), thumb);
  } catch (err) {
    await remove({ filePath, thumbPath }); // ne laisse pas de fichier orphelin
    throw err;
  }
}

/** Supprime les fichiers ; un fichier déjà absent n'est pas une erreur. */
export async function remove({ filePath, thumbPath }) {
  await Promise.all(
    [filePath, thumbPath].map((relativePath) => fs.rm(absolute(relativePath), { force: true })),
  );
}
