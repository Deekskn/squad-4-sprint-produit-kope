import { SESSION_COOKIE } from '../../config/session.js';
import * as service from './auth.service.js';

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
  res.status(201).json({ user });
}

export async function registerProfessional(req, res) {
  const user = await service.registerProfessional(req.validated.body);
  await startSession(req, user);
  res.status(201).json({ user });
}

export async function becomeProfessional(req, res) {
  const user = await service.becomeProfessional(req.session.user.id, req.validated.body);
  req.session.user = { id: user.id, role: user.role };
  res.json({ user });
}

export async function login(req, res) {
  const user = await service.login(req.validated.body);
  await startSession(req, user);
  res.json({ user });
}

export function logout(req, res, next) {
  req.session.destroy((err) => {
    if (err) return next(err);
    res.clearCookie(SESSION_COOKIE);
    res.status(204).end();
  });
}

export async function me(req, res, next) {
  const user = await service.getCurrentUser(req.session.user.id);
  if (!user) {
    // compte supprimé depuis : on ferme la session
    return logout(req, res, next);
  }
  res.json({ user });
}
