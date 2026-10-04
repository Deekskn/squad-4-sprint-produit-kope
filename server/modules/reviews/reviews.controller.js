import * as service from './reviews.service.js';

export async function create(req, res) {
  const review = await service.createReview(req.session.user.id, req.validated.params.id, req.validated.body);
  res.status(201).json({ review });
}

export async function list(req, res) {
  res.json(await service.listReviews(req.session.user, req.validated.params.id, req.validated.query));
}
