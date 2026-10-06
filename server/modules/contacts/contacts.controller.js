import * as service from './contacts.service.js';

export async function create(req, res) {
  const sender = req.user ?? req.session.user;
  const contact = await service.createContact(sender.id, req.validated.body);
  res.status(201).json({ contact });
}

export async function list(req, res) {
  const user = req.user ?? req.session.user;
  res.json(await service.listContacts(user.id, req.validated.query));
}
