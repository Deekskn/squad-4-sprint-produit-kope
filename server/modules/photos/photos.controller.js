import * as service from './photos.service.js';

export async function add(req, res) {
  const photo = await service.addPhoto(req.session.user.id, req.file, req.validated.body);
  res.status(201).json({ photo });
}

export async function remove(req, res) {
  await service.removePhoto(req.session.user.id, req.validated.params.id);
  res.status(204).end();
}
