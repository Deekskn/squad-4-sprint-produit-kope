import { ApiError } from '../utils/ApiError.js';
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7), env.ACCESS_TOKEN_SECRET);
      req.user = { id: Number(payload.sub), role: payload.role };
      return next();
    } catch {
      // Bearer expiré/invalide : on retombe sur la session cookie plutôt que d'échouer
    }
  }
  if (!req.session?.user) throw ApiError.unauthorized();
  req.user = req.session.user;
  req.bearerExpired = true;
  next();
}
