import { ApiError } from '../utils/ApiError.js';
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
        
      }
    }
    if (!user && req.session?.user) {
      user = req.session.user;
      req.user = user;
      req.bearerExpired = true;
    }
    if (!user) throw ApiError.unauthorized();
    if (!roles.includes(user.role)) throw ApiError.forbidden();
    next();
  };
}
