import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginate } from '../../utils/pagination.js';
import * as repository from './admin.repository.js';

export async function listProfessionals(pagination) {
  const rows = await repository.listProfessionals({ limit: pagination.pageSize, offset: offsetOf(pagination) });
  return paginate(rows, pagination);
}

export async function listReviews(pagination) {
  const rows = await repository.listReviews({ limit: pagination.pageSize, offset: offsetOf(pagination) });
  return paginate(rows, pagination);
}

/** profil masqué = absent des recherches. */
export async function setProfessionalHidden(id, hidden) {
  const updated = await repository.setProfessionalHidden(id, hidden);
  if (!updated) throw ApiError.notFound('Profil introuvable');
  return { id, hidden };
}

/** avis masqué = non affiché et exclu des calculs. */
export async function setReviewHidden(id, hidden) {
  const updated = await repository.setReviewHidden(id, hidden);
  if (!updated) throw ApiError.notFound('Avis introuvable');
  return { id, hidden };
}
