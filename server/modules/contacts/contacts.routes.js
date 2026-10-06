import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { paginationSchema } from '../../utils/commonSchemas.js';
import { createContactSchema } from './contacts.schemas.js';
import * as controller from './contacts.controller.js';

const router = Router();

// Un client comme un professionnel peut contacter un autre utilisateur.
router.post(
  '/contacts',
  requireRole('client', 'professional'),
  validate(createContactSchema),
  controller.create,
);

// Mes contacts, tous rôles confondus.
router.get(
  '/contacts',
  requireRole('client', 'professional'),
  validate(paginationSchema, 'query'),
  controller.list,
);

export default router;
