import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginate } from '../../utils/pagination.js';
import * as repository from './reviews.repository.js';
import * as professionalsRepository from '../professionals/professionals.repository.js';


export function getSummary(professionalId) {
  return repository.getSummary(professionalId);
}

export async function canReview(viewer, professionalId) {
  if (viewer?.role !== 'client') return false;
  return !(await repository.exists(viewer.id, professionalId));
}

export async function createReview(clientId, professionalId, { rating, comment }) {
  if (!(await professionalsRepository.existsPublished(professionalId))) {
    throw ApiError.notFound('Profil introuvable');
  }

  try {
    return await repository.create({ clientId, professionalId, rating, comment });
  } catch (err) {
    if (err.code === '23505') throw ApiError.conflict('Vous avez déjà laissé un avis à ce professionnel');
    throw err;
  }
}

export async function mine(clientId, pagination) {
  const rows = await repository.listByClient(clientId, { limit: pagination.pageSize, offset: offsetOf(pagination) });
  return paginate(rows, pagination);
}

export async function byClient(clientId, pagination) {
  const rows = await repository.listByClient(clientId, { limit: pagination.pageSize, offset: offsetOf(pagination) });
  return paginate(rows, pagination);
}

export async function listReviews(viewer, professionalId, pagination) {
  const isOwner = viewer?.role === 'professional' && viewer.id === professionalId;
  if (!isOwner && !(await professionalsRepository.existsPublished(professionalId))) {
    throw ApiError.notFound('Profil introuvable');
  }

  const [rows, summary] = await Promise.all([
    repository.listByProfessional(professionalId, { limit: pagination.pageSize, offset: offsetOf(pagination) }),
    repository.getSummary(professionalId),
  ]);

  return { summary, ...paginate(rows, pagination) };
}
