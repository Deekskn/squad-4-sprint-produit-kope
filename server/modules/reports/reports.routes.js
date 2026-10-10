import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { idParamSchema } from '../../utils/commonSchemas.js';
import { createReportSchema, listReportsQuerySchema, reportStatusSchema } from './reports.schemas.js';
import * as controller from './reports.controller.js';

const router = Router();

// Signalement d'un profil depuis la fiche publique
router.post(
  '/professionals/:id/reports',
  requireAuth,
  validate(idParamSchema, 'params'),
  validate(createReportSchema),
  controller.create,
);

// Traitement côté administrateur
router.get('/admin/reports', requireRole('admin'), validate(listReportsQuerySchema, 'query'), controller.list);
router.patch(
  '/admin/reports/:id',
  requireRole('admin'),
  validate(idParamSchema, 'params'),
  validate(reportStatusSchema),
  controller.setStatus,
);

export default router;
