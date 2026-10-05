import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { getProDetailMock, MOCK_PROS } from '@/mocks/appMock.js';

function ownProfileFromMock() {
  const p = MOCK_PROS[0];
  return {
    id: p.id,
    displayName: p.displayName,
    tradeId: p.tradeId,
    tradeName: p.tradeName,
    description: p.description,
    yearsExperience: p.yearsExperience,
    whatsapp: p.whatsapp ?? p.phone,
    isAvailable: p.isAvailable,
    isHidden: false,
    isPublished: true,
    photoCount: p.photos.length,
    zones: p.zones,
    photos: p.photos,
    status: 'published',
    missing: [],
  };
}

export function getMyProfile() {
  return callApi(
    () => api.get('/me/profile').then((r) => r.profile),
    async () => ownProfileFromMock(),
  );
}

export function updateMyProfile(payload) {
  return callApi(
    () => api.putJson('/me/profile', payload).then((r) => r.profile),
    async () => {
      const p = MOCK_PROS[0];
      Object.assign(p, {
        description: payload.description ?? p.description,
        yearsExperience: payload.yearsExperience ?? p.yearsExperience,
        whatsapp: payload.whatsapp ?? p.whatsapp,
      });
      return { ...ownProfileFromMock(), ...payload };
    },
  );
}

export function setAvailability(isAvailable) {
  return callApi(
    () => api.patchJson('/me/availability', { isAvailable }).then((r) => r.isAvailable),
    async () => {
      MOCK_PROS[0].isAvailable = Boolean(isAvailable);
      return Boolean(isAvailable);
    },
  );
}

export function getPublishedDetail(id) {
  return callApi(
    () => api.get(`/professionals/${id}`),
    async () => getProDetailMock(id) ?? (() => { throw Object.assign(new Error('Profil introuvable'), { status: 404 }); })(),
  );
}

export function canReview(id) {
  return callApi(
    () => api.get(`/professionals/${id}/can-review`).then((r) => r.canReview),
    async () => true,
  );
}

export default { getMyProfile, updateMyProfile, setAvailability, getPublishedDetail, canReview };
