import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { MOCK_PROS } from '@/mocks/appMock.js';

export function listPhotos() {
  return callApi(
    () => api.get('/me/profile').then((r) => r.profile?.photos || []),
    async () => MOCK_PROS[0].photos,
  );
}

export function addPhoto(file, { title, description } = {}) {
  const fd = new FormData();
  fd.append('photo', file);
  fd.append('title', String(title ?? '').slice(0, 100));
  fd.append('description', String(description ?? '').slice(0, 500));
  return callApi(
    () => api.postFormData('/me/photos', fd).then((r) => r.photo),
    async () => {
      const url = file ? URL.createObjectURL(file) : MOCK_PROS[0].image;
      const photo = {
        id: Date.now(),
        url,
        thumbUrl: url,
        title: title ?? '',
        description: description ?? '',
        caption: title ?? '',
        createdAt: new Date().toISOString(),
      };
      MOCK_PROS[0].photos = [...MOCK_PROS[0].photos, photo];
      return photo;
    },
  );
}

export function deletePhoto(photoId) {
  return callApi(
    () => api.del(`/me/photos/${photoId}`),
    async () => {
      MOCK_PROS[0].photos = MOCK_PROS[0].photos.filter((p) => p.id !== photoId);
      return {};
    },
  );
}

export default { listPhotos, addPhoto, deletePhoto };
