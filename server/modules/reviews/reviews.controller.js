import { ApiError } from '../../utils/ApiError.js';
import * as service from './reviews.service.js';

const currentUser = (req) => req.user ?? req.session?.user ?? null;

export async function create(req, res) {
  const review = await service.createReview((req.user ?? req.session.user).id, req.validated.params.id, req.validated.body);
  res.status(201).json({ review });
}

export async function list(req, res) {
  res.json(await service.listReviews((req.user ?? req.session.user), req.validated.params.id, req.validated.query));
}

export async function mine(req, res) {
  const viewer = req.user ?? req.session.user;
  res.json(await service.mine(viewer.id, req.validated.query));
}

export async function byClient(req, res) {
  const viewer = currentUser(req);
  const isSelf = viewer && String(viewer.id) === String(req.validated.params.id);
  if (!isSelf && viewer?.role !== 'admin')
    throw ApiError.forbidden();

  res.json(await service.byClient(req.validated.params.id, req.validated.query));
}
