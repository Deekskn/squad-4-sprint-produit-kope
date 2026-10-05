import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireAuth } from '../../middlewares/requireAuth.js';
import { loginSchema, registerClientSchema, registerProfessionalSchema, becomeProfessionalSchema } from './auth.schemas.js';
import * as controller from './auth.controller.js';

const router = Router();

router.post('/auth/register/client', validate(registerClientSchema), controller.registerClient);
router.post('/auth/register/professional', validate(registerProfessionalSchema), controller.registerProfessional);
router.post('/auth/become-professional', requireAuth, validate(becomeProfessionalSchema), controller.becomeProfessional);
router.post('/auth/login', validate(loginSchema), controller.login);
router.post('/auth/refresh', controller.refresh);
router.post('/auth/logout', controller.logout);
router.get('/auth/me', requireAuth, controller.me);

// US-18 (Could) : mot de passe oublié — à ajouter quand la story sera arbitrée.

export default router;
