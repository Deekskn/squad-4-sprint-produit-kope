import { SESSION_COOKIE } from '../../config/session.js';
import { env } from '../../config/env.js';
import { signToken, verifyToken } from '../../utils/tokens.js';
import { ApiError } from '../../utils/ApiError.js';
import * as service from './auth.service.js';

function issueTokens(user) {
  return {
    accessToken: signToken({ sub: user.id, role: user.role }, env.ACCESS_TOKEN_SECRET, env.ACCESS_TOKEN_TTL),
    refreshToken: signToken({ sub: user.id, role: user.role, type: 'refresh' }, env.REFRESH_TOKEN_SECRET, env.REFRESH_TOKEN_TTL),
  };
}

function currentUser(req) {
  return req.user ?? req.session?.user ?? null;
}

/**
 * Ouvre une session pour l'utilisateur. regenerate() change l'identifiant de session
 * à la connexion (protection contre la fixation de session).
 */
function startSession(req, user) {
  return new Promise((resolve, reject) => { 
    req.session.regenerate((err) => {
      if (err) return reject(err);
      req.session.user = { id: user.id, role: user.role };
      req.session.save((saveErr) => (saveErr ? reject(saveErr) : resolve()));
    });
  });
}

export async function registerClient(req, res) {
  const user = await service.registerClient(req.validated.body);
  await startSession(req, user);
  res.status(201).json({ user, ...issueTokens(user) });
}

export async function registerProfessional(req, res) {
  const user = await service.registerProfessional(req.validated.body);
  await startSession(req, user);
  res.status(201).json({ user, ...issueTokens(user) });
}

export async function becomeProfessional(req, res) {
  const user = await service.becomeProfessional(currentUser(req).id, req.validated.body);
  req.session.user = { id: user.id, role: user.role };
  res.json({ user, ...issueTokens(user) });
}

export async function login(req, res) {
  const user = await service.login(req.validated.body);
  await startSession(req, user);
  res.json({ user, ...issueTokens(user) });
}

export function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  });
}

export async function me(req, res, next) {
  const user = await service.getCurrentUser(currentUser(req).id);
  if (!user) {
    // compte supprimé depuis : on ferme la session
    return logout(req, res, next);
  }
  res.json({ user });
}

/** POST /auth/refresh : échange un refresh token valide contre une nouvelle paire. */
export async function refresh(req, res) {
  const { refreshToken } = req.body ?? {};
  if (!refreshToken) throw ApiError.unauthorized('Refresh token manquant');
  let payload;
  try {
    payload = verifyToken(refreshToken, env.REFRESH_TOKEN_SECRET);
  } catch {
    throw ApiError.unauthorized('Refresh token invalide ou expiré');
  }
  if (payload.type !== 'refresh') throw ApiError.unauthorized('Token invalide');
  const user = await service.getCurrentUser(payload.sub);
  if (!user) throw ApiError.unauthorized('Compte introuvable');
  res.json({ user, ...issueTokens(user) });
}
