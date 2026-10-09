import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';
import { verifyToken } from '../utils/tokens.js';
import { isBlocked } from '../modules/auth/auth.repository.js';

const ACCOUNT_BLOCKED = 'Ce compte a été bloqué par un administrateur.';

async function rejectIfBlocked(userId) {
  if (await isBlocked(userId)) throw ApiError.forbidden(ACCOUNT_BLOCKED);
}

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer '))
      try {
        const payload = verifyToken(authHeader.slice(7), env.ACCESS_TOKEN_SECRET);
        req.user = { id: Number(payload.sub), role: payload.role };
        await rejectIfBlocked(req.user.id);
        return next();
      } catch (err) {
        // Un compte bloqué remonte une 403 : on ne la transforme pas en 401.
        if (err?.status === 403) throw err;
        // header présent mais invalide/expiré
        req.bearerExpired = true;
      }

    if (!req.session?.user) throw ApiError.unauthorized();
    req.user = req.session.user;
    await rejectIfBlocked(req.user.id);
    return next();
  } catch (err) {
    return next(err);
  }
}
