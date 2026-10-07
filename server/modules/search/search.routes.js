import { Router } from 'express';
import { validate } from '../../middlewares/validate.js';
import { searchQuerySchema } from './search.schemas.js';
import * as controller from './search.controller.js';
const router = Router();
router.get('/professionals', validate(searchQuerySchema, 'query'), controller.search);
router.get('/professionals/:id', controller.getPublishedDetail);
router.get('/professionals/:id/can-review', controller.getCanReview);
export default router;
