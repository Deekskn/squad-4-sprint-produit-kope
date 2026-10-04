import * as service from './admin.service.js';

export async function listProfessionals(req, res) {
  res.json(await service.listProfessionals(req.validated.query));
}

export async function setProfessionalHidden(req, res) {
  res.json(await service.setProfessionalHidden(req.validated.params.id, req.validated.body.hidden));
}

export async function listReviews(req, res) {
  res.json(await service.listReviews(req.validated.query));
}

export async function setReviewHidden(req, res) {
  res.json(await service.setReviewHidden(req.validated.params.id, req.validated.body.hidden));
}
