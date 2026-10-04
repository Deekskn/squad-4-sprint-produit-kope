import { withTransaction } from '../../db/pool.js';
import { ApiError } from '../../utils/ApiError.js';
import { uploadUrl } from '../../utils/uploads.js';
import * as repository from './photos.repository.js';
import * as storage from './photos.storage.js';

const MAX_PHOTOS = 10;
const LIMIT_MESSAGE = 'Limite de 10 photos atteinte';

function toDto(photo) {
  return {
    id: photo.id,
    url: uploadUrl(photo.filePath),
    thumbUrl: uploadUrl(photo.thumbPath),
    caption: photo.caption,
  };
}

/** Utilisé aussi par professionals.service (fiche publique et profil). */
export async function listPhotos(professionalId) {
  const photos = await repository.listByProfessional(professionalId);
  return photos.map(toDto);
}

/** US-05 : ajout d'une photo (JPG/PNG, 5 Mo, 10 photos max, redimensionnée + miniature). */
export async function addPhoto(professionalId, file, caption) {
  if (!file) {
    throw ApiError.badRequest('Aucune photo reçue', { photo: 'Choisissez une photo' });
  }

  // Vérification rapide avant le traitement d'image (qui coûte du CPU)
  if ((await repository.count(professionalId)) >= MAX_PHOTOS) {
    throw ApiError.badRequest(LIMIT_MESSAGE, { photo: LIMIT_MESSAGE });
  }

  const processed = await storage.processImage(file.buffer);
  const paths = storage.newPaths(professionalId);

  const photo = await withTransaction(async (tx) => {
    // On verrouille la ligne du professionnel : deux envois simultanés ne peuvent
    // pas dépasser la limite en passant chacun la vérification en même temps.
    await repository.lockProfessional(professionalId, tx);
    if ((await repository.count(professionalId, tx)) >= MAX_PHOTOS) {
      throw ApiError.badRequest(LIMIT_MESSAGE, { photo: LIMIT_MESSAGE });
    }

    const created = await repository.create(
      { professionalId, filePath: paths.filePath, thumbPath: paths.thumbPath, caption },
      tx,
    );
    await storage.save(paths, processed); // si l'écriture échoue : rollback
    return created;
  });

  return toDto(photo);
}

/** US-05 CA4 : la photo disparaît aussi de la fiche publique (même table). */
export async function removePhoto(professionalId, photoId) {
  const removed = await withTransaction((tx) => repository.remove(photoId, professionalId, tx)); // filtre par propriétaire
  if (!removed) throw ApiError.notFound('Photo introuvable');
  await storage.remove(removed);
}
