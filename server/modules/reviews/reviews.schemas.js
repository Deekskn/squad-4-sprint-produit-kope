import { z } from 'zod';

/** US-14 CA2 */
export const createReviewSchema = z.object({
  rating: z
    .number({ error: 'La note est obligatoire' })
    .int('La note doit être comprise entre 1 et 5')
    .min(1, 'La note doit être comprise entre 1 et 5')
    .max(5, 'La note doit être comprise entre 1 et 5'),
  comment: z
    .string()
    .trim()
    .max(300, 'Le commentaire ne doit pas dépasser 300 caractères')
    .nullish()
    .transform((value) => value || null),
});
