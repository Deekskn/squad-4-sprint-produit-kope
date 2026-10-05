import { api } from '@/lib/api.js';
import { callApi } from '@/lib/dataSource.js';
import { MOCK_PROS, mockReviewsFor } from '@/mocks/appMock.js';

export function listPros({ page = 1, pageSize = 20, query = '' } = {}) {
  return callApi(
    () => {
      const params = { page, pageSize };
      if (query) params.q = query;
      return api.get('/admin/professionals', params);
    },
    async () => {
      const q = query.trim().toLowerCase();
      const rows = MOCK_PROS.filter(
        (p) => !q || p.displayName.toLowerCase().includes(q) || p.trade.toLowerCase().includes(q),
      );
      const items = rows.slice((page - 1) * pageSize, page * pageSize).map((p) => ({
        id: p.id,
        displayName: p.displayName,
        trade: p.trade,
        zones: p.zones.map((z) => z.name),
        isAvailable: p.isAvailable,
        isHidden: p.isHidden,
        phone: p.phone,
      }));
      return { items, total: rows.length, page, pageSize, totalPages: 1 };
    },
  );
}

export function setProHidden(professionalId, hidden) {
  return callApi(
    () =>
      api
        .patchJson(`/admin/professionals/${professionalId}/hidden`, { hidden: Boolean(hidden) })
        .then((r) => r.professional),
    async () => {
      const p = MOCK_PROS.find((x) => String(x.id) === String(professionalId));
      if (p) p.isHidden = Boolean(hidden);
      return p;
    },
  );
}

export function listReviews({ page = 1, pageSize = 20, hidden } = {}) {
  return callApi(
    () => {
      const params = { page, pageSize };
      if (typeof hidden === 'boolean') params.hidden = String(hidden);
      return api.get('/admin/reviews', params);
    },
    async () => {
      const all = MOCK_PROS.flatMap((p) =>
        mockReviewsFor(p.id).map((r) => ({ ...r, professional: { id: p.id, displayName: p.displayName } })),
      );
      const filtered = typeof hidden === 'boolean' ? all.filter((r) => r.isHidden === hidden) : all;
      const items = filtered.slice((page - 1) * pageSize, page * pageSize);
      return { items, total: filtered.length, page, pageSize, totalPages: 1 };
    },
  );
}

export function setReviewHidden(reviewId, hidden) {
  return callApi(
    () =>
      api
        .patchJson(`/admin/reviews/${reviewId}/hidden`, { hidden: Boolean(hidden) })
        .then((r) => r.review),
    async () => ({ id: reviewId, isHidden: Boolean(hidden) }),
  );
}

export default { listPros, setProHidden, listReviews, setReviewHidden };
