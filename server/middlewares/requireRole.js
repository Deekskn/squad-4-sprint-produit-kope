import { ApiError } from '../utils/ApiError.js';
import { resolveUser, assertAccountActive } from './identity.js';

/** Autorise les rôles indiqués, et refuse aussi les comptes bloqués ou suspendus. */
export function requireRole(...roles) {
  return async (req, res, next) => {
    try {
      const user = resolveUser(req);
      if (!user) throw ApiError.unauthorized();
      // Sans ce contrôle, un administrateur bloqué garde ses droits jusqu'à
      // l'expiration de son access token.
      await assertAccountActive(user.id);
      if (!roles.includes(user.role)) throw ApiError.forbidden();

      req.user = user;
      return next();
    } catch (err) {
      return next(err);
    }
  };
}
