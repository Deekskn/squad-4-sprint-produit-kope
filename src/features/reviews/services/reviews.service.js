import { api } from '@/lib/api.js';

export function listReviews(professionalId, { page = 1, pageSize = 10 } = {}) {
  return api.get(`/professionals/${professionalId}/reviews`, { page, pageSize });
}

export function createReview(professionalId, payload) {
  return api.postJson(`/professionals/${professionalId}/reviews`, payload).then((r) => r.review);
}

export default { listReviews, createReview };
