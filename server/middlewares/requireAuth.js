import { ApiError } from '../utils/ApiError.js';
import { resolveUser, assertAccountActive } from './identity.js';

export async function requireAuth(req, res, next) {
  try {
    const user = resolveUser(req);
    if (!user) throw ApiError.unauthorized();

    req.user = user;
    // Un compte bloqué ou suspendu remonte une 403 : on ne la transforme pas en 401.
    await assertAccountActive(user.id);
    return next();
  } catch (err) {
    return next(err);
  }
}
