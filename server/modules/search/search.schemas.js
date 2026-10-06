import { z } from 'zod';
import { idSchema } from '../../utils/commonSchemas.js';
const emptyToUndefined = (value) => (value === '' ? undefined : value);
export const searchQuerySchema = z.object({
  trade: idSchema('Choisissez un métier'),                              
  zone: z.preprocess(emptyToUndefined, idSchema('Zone invalide').optional()), 
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
});