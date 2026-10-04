import { Router } from 'express';
import * as controller from './reference.controller.js';

const router = Router();

// Listes pour les formulaires d'inscription, de profil et de recherche (publiques)
router.get('/trades', controller.listTrades);
router.get('/zones', controller.listZones);

export default router;
