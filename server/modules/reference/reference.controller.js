import * as repository from './reference.repository.js';

// Module trivial : pas de service, le controller appelle directement le repository.
// Dès qu'il y a une règle métier, on ajoute reference.service.js.

export async function listTrades(req, res) {
  res.json({ trades: await repository.listTrades() });
}

export async function listZones(req, res) {
  res.json({ zones: await repository.listZones() });
}
