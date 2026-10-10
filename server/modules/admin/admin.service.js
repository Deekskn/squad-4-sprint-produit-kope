import bcrypt from 'bcryptjs';
import { ApiError } from '../../utils/ApiError.js';
import { offsetOf, paginateSafely } from '../../utils/pagination.js';
import * as repository from './admin.repository.js';
import * as refreshTokensRepository from '../auth/refreshTokens.repository.js';

const BCRYPT_ROUNDS = 10;

export async function listProfessionals(query) {
  const rows = await repository.listProfessionals({
    limit: query.pageSize,
    offset: offsetOf(query),
    q: query.q,
    status: query.status,
    sort: query.sort,
  });
  return paginateSafely(rows, query, () => repository.countProfessionals({ q: query.q, status: query.status }));
}

export async function listReviews(query) {
  const rows = await repository.listReviews({
    limit: query.pageSize,
    offset: offsetOf(query),
    hidden: query.hidden,
    q: query.q,
  });
  return paginateSafely(rows, query, () => repository.countReviews({ hidden: query.hidden, q: query.q }));
}

export async function listUsers(query) {
  const rows = await repository.listUsers({
    limit: query.pageSize,
    offset: offsetOf(query),
    role: query.role,
    q: query.q,
  });
  return paginateSafely(rows, query, () => repository.countUsers({ role: query.role, q: query.q }));
}

/** Bloque ou débloque un compte utilisateur. */
export async function setUserBlocked(actorId, id, blocked) {
  if (Number(actorId) === Number(id)) throw ApiError.badRequest('Vous ne pouvez pas bloquer votre propre compte');

  const target = blocked ? await repository.findUserById(id) : null;
  if (blocked && !target) throw ApiError.notFound('Utilisateur introuvable');
  if (blocked && target.role === 'admin' && (await repository.countActiveAdmins(id)) === 0)
    throw ApiError.badRequest('Impossible de bloquer le dernier administrateur actif');

  const updated = await repository.setUserBlocked(id, blocked);
  if (!updated) throw ApiError.notFound('Utilisateur introuvable');
  if (blocked) await refreshTokensRepository.revokeAllForUser(id);
  return updated;
}

/** Lève ou applique la suspension d'un compte. */
export async function setUserSuspended(actorId, id, suspended) {
  if (Number(actorId) === Number(id)) throw ApiError.badRequest('Vous ne pouvez pas suspendre votre propre compte');

  const target = await repository.findUserById(id);
  if (!target) throw ApiError.notFound('Utilisateur introuvable');
  if (suspended && target.role === 'admin' && (await repository.countActiveAdmins(id)) === 0)
    throw ApiError.badRequest('Impossible de suspendre le dernier administrateur actif');

  const updated = await repository.setUserSuspended(id, suspended);
  if (!updated) throw ApiError.notFound('Utilisateur introuvable');
  // Une suspension imply le blocage ; lever la suspension redonne aussi l'accès.
  await repository.setUserBlocked(id, suspended);
  if (suspended) await refreshTokensRepository.revokeAllForUser(id);
  return updated;
}

/** Crée un compte administrateur. */
export async function createAdmin({ firstName, lastName, phone, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  try {
    return await repository.createAdminUser({ firstName, lastName, phone, passwordHash });
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Ce numéro est déjà utilisé');
    throw err;
  }
}

export async function getStats() {
  const stats = await repository.countStats();
  const recent = await repository.listRecentProfessionals(5);
  // `published` et `hidden` sont disjoints (la vue exclut les profils masqués) :
  // le solde correspond aux profils incomplets.
  const incomplete = Math.max(0, stats.total - stats.published - stats.hidden);
  return {
    users: stats.users,
    clients: stats.clients,
    professionals: stats.professionals,
    published: stats.published,
    hidden: stats.hidden,
    incomplete,
    reviews: stats.reviews,
    reviewsHidden: stats.reviewsHidden,
    ratingAverage: stats.ratingAverage,
    contacts: stats.contacts,
    recentProfessionals: recent,
  };
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

export async function listTrades() {
  return { items: await repository.listTrades() };
}

export async function createTrade({ name, categoryId }) {
  try {
    return await repository.createTrade(name, categoryId);
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Ce métier existe déjà');
    if (err?.code === '23503') throw ApiError.badRequest('Catégorie inconnue');
    throw err;
  }
}

export async function updateTrade(id, { name, categoryId }) {
  try {
    const updated = await repository.updateTrade(id, name, categoryId);
    if (!updated) throw ApiError.notFound('Métier introuvable');
    return updated;
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Ce métier existe déjà');
    if (err?.code === '23503') throw ApiError.badRequest('Catégorie inconnue');
    throw err;
  }
}

export async function listTradeCategories() {
  return { items: await repository.listTradeCategories() };
}

export async function createTradeCategory({ name }) {
  try {
    return await repository.createTradeCategory(name);
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Cette catégorie existe déjà');
    throw err;
  }
}

export async function updateTradeCategory(id, { name }) {
  try {
    const updated = await repository.updateTradeCategory(id, name);
    if (!updated) throw ApiError.notFound('Catégorie introuvable');
    return updated;
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Cette catégorie existe déjà');
    throw err;
  }
}

export async function deleteTradeCategory(id) {
  if (await repository.tradeCategoryInUse(id))
    throw ApiError.badRequest('Déplacez les métiers de cette catégorie avant de la supprimer');
  const deleted = await repository.deleteTradeCategory(id);
  if (!deleted) throw ApiError.notFound('Catégorie introuvable');
  return { id };
}

export async function reorderTradeCategories(ids) {
  await repository.reorderTradeCategories(ids);
  return { ids };
}

export async function deleteTrade(id) {
  if (await repository.tradeInUse(id)) throw ApiError.badRequest('Ce métier est utilisé par des professionnels');
  const deleted = await repository.deleteTrade(id);
  if (!deleted) throw ApiError.notFound('Métier introuvable');
  return { id };
}

export async function reorderTrades(ids) {
  await repository.reorderTrades(ids);
  return { ids };
}

export async function listZones() {
  return { items: await repository.listZones() };
}

export async function createZone({ name, cityId }) {
  try {
    return await repository.createZone(name, cityId);
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Cette zone existe déjà');
    if (err?.code === '23503') throw ApiError.badRequest('Ville inconnue');
    throw err;
  }
}

export async function updateZone(id, { name, cityId }) {
  try {
    const updated = await repository.updateZone(id, name, cityId);
    if (!updated) throw ApiError.notFound('Zone introuvable');
    return updated;
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Cette zone existe déjà');
    if (err?.code === '23503') throw ApiError.badRequest('Ville inconnue');
    throw err;
  }
}

export async function listCities() {
  return { items: await repository.listCities() };
}

export async function createCity({ name }) {
  try {
    return await repository.createCity(name);
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Cette ville existe déjà');
    throw err;
  }
}

export async function updateCity(id, { name }) {
  try {
    const updated = await repository.updateCity(id, name);
    if (!updated) throw ApiError.notFound('Ville introuvable');
    return updated;
  } catch (err) {
    if (err?.code === '23505') throw ApiError.conflict('Cette ville existe déjà');
    throw err;
  }
}

export async function deleteCity(id) {
  if (await repository.cityInUse(id))
    throw ApiError.badRequest('Déplacez les arrondissements de cette ville avant de la supprimer');
  const deleted = await repository.deleteCity(id);
  if (!deleted) throw ApiError.notFound('Ville introuvable');
  return { id };
}

export async function reorderCities(ids) {
  await repository.reorderCities(ids);
  return { ids };
}

export async function deleteZone(id) {
  if (await repository.zoneInUse(id)) throw ApiError.badRequest('Cette zone est utilisée par des professionnels');
  const deleted = await repository.deleteZone(id);
  if (!deleted) throw ApiError.notFound('Zone introuvable');
  return { id };
}

export async function reorderZones(ids) {
  await repository.reorderZones(ids);
  return { ids };
}
