import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { searchQuerySchema } from './search.schemas.js';
import * as controller from './search.controller.js';

const router = Router();

// US-07 + US-13 : public (fonctionne sans connexion)
// Exemple : GET /api/professionals?trade=1&zone=3&page=1
router.get('/professionals', validate(searchQuerySchema, 'query'), controller.search);

// US-07 CA3 + US-15 : fiche publique (detail + photo + note)
router.get('/professionals/:id', controller.getPublishedDetail);
// US-14 CA1 : condition d'affichage du bouton "Donner mon avis"
router.get('/professionals/:id/can-review', controller.getCanReview);

export default router;
