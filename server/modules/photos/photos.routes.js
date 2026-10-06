import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { requireRole } from '../../middlewares/requireRole.js';
import { upload } from '../../middlewares/upload.js';
import { idParamSchema } from '../../utils/commonSchemas.js';
import { addPhotoSchema } from './photos.schemas.js';
import * as controller from './photos.controller.js';

const router = Router();

// US-05 : multipart/form-data avec le champ fichier "photo" + texte "title" et "description" (modal d'ajout)
router.post(
  '/me/photos',
  requireRole('professional'),
  upload.single('photo'),
  validate(addPhotoSchema),
  controller.add,
);

// Modification du titre / de la description (bouton "Modifier" de la grille de photos)
router.put(
  '/me/photos/:id',
  requireRole('professional'),
  validate(idParamSchema, 'params'),
  validate(addPhotoSchema),
  controller.update,
);

router.delete(
  '/me/photos/:id',
  requireRole('professional'),
  validate(idParamSchema, 'params'),
  controller.remove,
);

export default router;
