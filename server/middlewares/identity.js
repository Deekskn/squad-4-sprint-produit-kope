import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/tokens.js';
import { isBlocked, isSuspended } from '../modules/auth/auth.repository.js';

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

/** Interrompt la requête si le compte est suspendu ou bloqué. */
export async function assertAccountActive(userId) {
  if (await isSuspended(userId)) throw ApiError.forbidden(ACCOUNT_SUSPENDED);
  if (await isBlocked(userId)) throw ApiError.forbidden(ACCOUNT_BLOCKED);
}
