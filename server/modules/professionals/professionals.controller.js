import * as service from './professionals.service.js';

export async function getMyProfile(req, res) {
  res.json({ profile: await service.getOwnProfile((req.user ?? req.session.user).id) });
}

export async function updateMyProfile(req, res) {
  res.json({ profile: await service.updateOwnProfile((req.user ?? req.session.user).id, req.validated.body) });
}

export async function setAvailability(req, res) {
  const { isAvailable } = req.validated.body;
  await service.setAvailability((req.user ?? req.session.user).id, isAvailable);
  res.json({ isAvailable });
}
