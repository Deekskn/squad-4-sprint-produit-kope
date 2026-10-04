import { ApiError } from '../utils/ApiError.js';

/** Refuse les visiteurs non connectés (401). L'utilisateur est dans req.session.user = { id, role }. */
export function requireAuth(req, res, next) {
  if (!req.session?.user) throw ApiError.unauthorized();
  next();
}
