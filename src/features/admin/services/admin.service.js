import { api } from '@/lib/api.js';

export function listPros({ page = 1, pageSize = 20, query = '' } = {}) {
  const params = { page, pageSize };
  if (query) params.q = query;
  return api.get('/admin/professionals', params);
}

export function setProHidden(professionalId, hidden) {
  return api
    .patchJson(`/admin/professionals/${professionalId}/hidden`, { hidden: Boolean(hidden) })
    .then((r) => r.professional);
}

export function listReviews({ page = 1, pageSize = 20, hidden } = {}) {
  const params = { page, pageSize };
  if (typeof hidden === 'boolean') params.hidden = String(hidden);
  return api.get('/admin/reviews', params);
}

export function setReviewHidden(reviewId, hidden) {
  return api
    .patchJson(`/admin/reviews/${reviewId}/hidden`, { hidden: Boolean(hidden) })
    .then((r) => r.review);
}

export default { listPros, setProHidden, listReviews, setReviewHidden };
