import { z } from 'zod';

export const addPhotoSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(100, 'La légende ne doit pas dépasser 100 caractères')
    .nullish()
    .transform((value) => value || null),
});
