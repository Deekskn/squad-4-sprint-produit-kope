import { Router } from 'express';
import * as controller from './reference.controller.js';

const router = Router();

router.get('/trades', controller.listTrades);
router.get('/zones', controller.listZones);

export default router;
