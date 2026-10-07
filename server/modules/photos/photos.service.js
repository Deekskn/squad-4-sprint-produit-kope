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
    title: photo.title ?? photo.caption ?? null,
    description: photo.description ?? null,
    caption: photo.caption,
  };
}

export async function listPhotos(professionalId) {
  const photos = await repository.listByProfessional(professionalId);
  return photos.map(toDto);
}

/** US-05 */
export async function addPhoto(professionalId, file, { title, description }) {
  if (!file) 
    throw ApiError.badRequest('Aucune photo reçue', { photo: 'Choisissez une photo' });
  

  if ((await repository.count(professionalId)) >= MAX_PHOTOS) 
    throw ApiError.badRequest(LIMIT_MESSAGE, { photo: LIMIT_MESSAGE });
  

  const processed = await storage.processImage(file.buffer);
  const paths = storage.newPaths(professionalId);

  const photo = await withTransaction(async (tx) => {
    await repository.lockProfessional(professionalId, tx);
    if ((await repository.count(professionalId, tx)) >= MAX_PHOTOS) 
      throw ApiError.badRequest(LIMIT_MESSAGE, { photo: LIMIT_MESSAGE });
    

    const created = await repository.create(
      { professionalId, filePath: paths.filePath, thumbPath: paths.thumbPath, title, description },
      tx,
    );
    await storage.save(paths, processed); 
    return created;
  });

  return toDto(photo);
}

/** Modification du titre */
export async function updatePhoto(professionalId, photoId, { title, description }) {
  const updated = await repository.update(photoId, professionalId, { title, description });
  if (!updated) throw ApiError.notFound('Photo introuvable');
  return toDto(updated);
}

/** US-05 */
export async function removePhoto(professionalId, photoId) {
  const removed = await withTransaction((tx) => repository.remove(photoId, professionalId, tx)); // filtre par propriétaire
  if (!removed) throw ApiError.notFound('Photo introuvable');
  await storage.remove(removed);
}
