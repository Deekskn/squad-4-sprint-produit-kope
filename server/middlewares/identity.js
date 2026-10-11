import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/tokens.js';
import { getAccountState } from '../modules/auth/auth.repository.js';

const ACCOUNT_BLOCKED = 'Ce compte a été bloqué par un administrateur.';
const ACCOUNT_SUSPENDED = 'Votre compte a été suspendu.';

/**
 * Résout l'utilisateur de la requête sans le valider : Bearer d'abord, session en repli.
 * Renvoie null si aucune identité exploitable n'est présente.
 */
export function resolveUser(req) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer '))
    try {
      const payload = verifyToken(authHeader.slice(7), env.ACCESS_TOKEN_SECRET);
      return { id: Number(payload.sub), role: payload.role };
    } catch {
      // header présent mais invalide ou expiré : on tente la session.
      req.bearerExpired = true;
    }

  return req.session?.user ?? null;
}

/**
 * Relit l'état du compte en base et refuse la requête si le compte a été
 * bloqué ou suspendu. Renvoie l'utilisateur avec son rôle réellement courant :
 * le rôle inscrit dans le access token peut être périmé après une rétrogradation.
 */
export async function loadActiveUser(userId) {
  const state = await getAccountState(userId);
  if (!state) throw ApiError.unauthorized();
  if (state.suspendedAt) throw ApiError.forbidden(ACCOUNT_SUSPENDED);
  if (state.blockedAt) throw ApiError.forbidden(ACCOUNT_BLOCKED);

  return { id: userId, role: state.role };
}
