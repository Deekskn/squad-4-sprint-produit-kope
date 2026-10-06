import { ApiError } from '../utils/ApiError.js';
export function requireRole(...roles) {
  return (req, res, next) => {
    const user = req.session?.user;
    if (!user) throw ApiError.unauthorized();
    if (!roles.includes(user.role)) throw ApiError.forbidden();
    next();
  };
}
