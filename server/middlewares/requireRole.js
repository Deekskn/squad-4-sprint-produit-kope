import { ApiError } from '../utils/ApiError.js';
import { verifyToken } from '../utils/tokens.js';
import { env } from '../config/env.js';

/**
 * Exige un des rôles donnés : requireRole('professional'), requireRole('client', 'admin').
 * Bearer token ou session. 401 si non connecté, 403 si le rôle ne correspond pas (US-03 CA5).
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    let user = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = verifyToken(authHeader.slice(7), env.ACCESS_TOKEN_SECRET);
        user = { id: Number(payload.sub), role: payload.role };
        req.user = user;
      } catch {
        throw ApiError.unauthorized('Session expirée, reconnectez-vous');
      }
    } else if (req.session?.user) {
      user = req.session.user;
      req.user = user;
    }
    if (!user) throw ApiError.unauthorized();
    if (!roles.includes(user.role)) throw ApiError.forbidden();
    next();
  };
}
