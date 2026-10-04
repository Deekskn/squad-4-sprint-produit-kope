import { z } from 'zod';
import { idSchema } from '../../utils/commonSchemas.js';

// Une valeur vide (?zone=) équivaut à "toute la ville"
const emptyToUndefined = (value) => (value === '' ? undefined : value);

export const searchQuerySchema = z.object({
  trade: idSchema('Choisissez un métier'),                              // obligatoire (US-07 CA1)
  zone: z.preprocess(emptyToUndefined, idSchema('Zone invalide').optional()), // facultatif
  page: z.preprocess(emptyToUndefined, z.coerce.number().int().min(1).default(1)),
});
