import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { env } from '../../config/env.js';
import { useCloud, uploadBuffer, destroyImage } from '../../config/cloudinary.js';
import { ApiError } from '../../utils/ApiError.js';

const MAIN_WIDTH = 1280; 
const THUMB_WIDTH = 400;
const INVALID_IMAGE = "Le fichier n'est pas une image JPG ou PNG valide";

export async function processImage(buffer) {
  try {
    const { format } = await sharp(buffer).metadata();
    if (format !== 'jpeg' && format !== 'png') throw new Error('format non supporté');

    const base = sharp(buffer).rotate().flatten({ background: '#ffffff' }); 
    const [main, thumb] = await Promise.all([
      base.clone().resize({ width: MAIN_WIDTH, withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer(),
      base.clone().resize({ width: THUMB_WIDTH, withoutEnlargement: true }).jpeg({ quality: 78 }).toBuffer(),
    ]);
    return { main, thumb };
  } catch {
    throw ApiError.badRequest(INVALID_IMAGE, { photo: INVALID_IMAGE });
  }
}

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
    if (useCloud) 
      await Promise.all([uploadBuffer(main, filePath), uploadBuffer(thumb, thumbPath)]);
     else {
      await fs.mkdir(path.dirname(absolute(filePath)), { recursive: true });
      await fs.writeFile(absolute(filePath), main);
      await fs.writeFile(absolute(thumbPath), thumb);
    }
  } catch (err) {
    await remove({ filePath, thumbPath }).catch(() => {}); 
    throw err;
  }
}

export async function remove({ filePath, thumbPath }) {
  const paths = [filePath, thumbPath];
  if (useCloud) 
    await Promise.all(paths.map(destroyImage));
   else 
    await Promise.all(paths.map((p) => fs.rm(absolute(p), { force: true })));
  
}