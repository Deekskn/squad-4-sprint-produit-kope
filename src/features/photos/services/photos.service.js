import { api } from '@/lib/api.js';

export function listPhotos() {
  return api.get('/me/profile').then((r) => r.profile?.photos || []);
}

export function addPhoto(file, caption) {
  const fd = new FormData();
  fd.append('photo', file);
  if (caption != null) fd.append('caption', String(caption).slice(0, 100));
  return api.postFormData('/me/photos', fd).then((r) => r.photo);
}

export function deletePhoto(photoId) {
  return api.del(`/me/photos/${photoId}`);
}

export default { listPhotos, addPhoto, deletePhoto };
