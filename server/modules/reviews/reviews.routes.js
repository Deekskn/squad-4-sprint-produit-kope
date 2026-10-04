import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema, paginationSchema } from '../../utils/commonSchemas.js';
import { createReviewSchema } from './reviews.schemas.js';
import * as controller from './reviews.controller.js';

const router = Router();

// US-15 : public
router.get(
  '/professionals/:id/reviews',
  validate(idParamSchema, 'params'),
  validate(paginationSchema, 'query'),
  controller.list,
);

// US-14 : réservé aux clients (un professionnel ne peut pas laisser d'avis, CA5)
router.post(
  '/professionals/:id/reviews',
  requireRole('client'),
  validate(idParamSchema, 'params'),
  validate(createReviewSchema),
  controller.create,
);

export default router;
