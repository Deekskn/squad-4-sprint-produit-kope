import { z } from 'zod';
import { idSchema } from '../../utils/commonSchemas.js';

export const createContactSchema = z.object({
  toUserId: idSchema('Identifiant invalide'),
  message: z
    .string({ error: 'Le message est obligatoire' })
    .trim()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(500, 'Le message ne doit pas dépasser 500 caractères'),
});
