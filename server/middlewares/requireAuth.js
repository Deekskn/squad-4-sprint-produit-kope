import { ApiError } from '../utils/ApiError.js';
export function requireAuth(req, res, next) {
  if (!req.session?.user) throw ApiError.unauthorized();
  next();
}
