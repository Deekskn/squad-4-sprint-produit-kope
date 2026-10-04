import { api } from '@/lib/api.js';

export function getMyProfile() {
  return api.get('/me/profile').then((r) => r.profile);
}

export function updateMyProfile(payload) {
  return api.putJson('/me/profile', payload).then((r) => r.profile);
}

export function setAvailability(isAvailable) {
  return api.patchJson('/me/availability', { isAvailable }).then((r) => r.isAvailable);
}

export function getPublishedDetail(id) {
  return api.get(`/professionals/${id}`);
}

export function canReview(id) {
  return api.get(`/professionals/${id}/can-review`).then((r) => r.canReview);
}

export default { getMyProfile, updateMyProfile, setAvailability, getPublishedDetail, canReview };
