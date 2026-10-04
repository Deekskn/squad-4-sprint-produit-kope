import { ApiError } from '../utils/ApiError.js';

/**
 * Exige un des rôles donnés : requireRole('professional'), requireRole('client', 'admin')…
 * 401 si non connecté, 403 si le rôle ne correspond pas (US-03 CA5).
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) throw ApiError.unauthorized();
    if (!roles.includes(user.role)) throw ApiError.forbidden();
    next();
  };
}
