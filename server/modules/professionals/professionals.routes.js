import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { availabilitySchema, updateProfileSchema } from './professionals.schemas.js';
import * as controller from './professionals.controller.js';

const router = Router();

// Espace du professionnel connecté (US-04, US-06, US-12)
router.get('/me/profile', requireRole('professional'), controller.getMyProfile);
router.put('/me/profile', requireRole('professional'), validate(updateProfileSchema), controller.updateMyProfile);
router.patch('/me/availability', requireRole('professional'), validate(availabilitySchema), controller.setAvailability);

export default router;
