import * as repository from './reference.repository.js';

export async function listTrades(req, res) {
  res.json({ trades: await repository.listTrades() });
}

export async function listZones(req, res) {
  res.json({ zones: await repository.listZones() });
}
