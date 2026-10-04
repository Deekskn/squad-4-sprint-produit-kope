import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema, paginationSchema } from '../../utils/commonSchemas.js';
import { visibilitySchema } from './admin.schemas.js';
import * as controller from './admin.controller.js';

const router = Router();

// Tout ce qui est sous /admin est réservé à l'administrateur (US-16)
router.use('/admin', requireRole('admin'));

router.get('/admin/professionals', validate(paginationSchema, 'query'), controller.listProfessionals);
router.patch(
  '/admin/professionals/:id/visibility',
  validate(idParamSchema, 'params'),
  validate(visibilitySchema),
  controller.setProfessionalHidden,
);

router.get('/admin/reviews', validate(paginationSchema, 'query'), controller.listReviews);
router.patch(
  '/admin/reviews/:id/visibility',
  validate(idParamSchema, 'params'),
  validate(visibilitySchema),
  controller.setReviewHidden,
);

export default router;
