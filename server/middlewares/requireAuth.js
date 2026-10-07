import { ApiError } from '../utils/ApiError.js';
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const payload = verifyToken(authHeader.slice(7), env.ACCESS_TOKEN_SECRET);
      req.user = { id: Number(payload.sub), role: payload.role };
      return next();
    } catch {
      
    }
  }
  if (!req.session?.user) throw ApiError.unauthorized();
  req.user = req.session.user;
  req.bearerExpired = true;
  next();
}
