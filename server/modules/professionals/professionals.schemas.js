import { z } from 'zod';
import { phoneSchema, zoneIdsSchema } from '../../utils/commonSchemas.js';

/** US-04 : description 30-500, expérience 0-60, WhatsApp (vide = numéro du compte), zones. */
export const updateProfileSchema = z.object({
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(30, 'La description doit contenir au moins 30 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
  yearsExperience: z.coerce
    .number({ error: "Indiquez vos années d'expérience" })
    .int("Indiquez un nombre entier d'années")
    .min(0, "Les années d'expérience doivent être comprises entre 0 et 60")
    .max(60, "Les années d'expérience doivent être comprises entre 0 et 60"),
  whatsapp: z.preprocess((value) => (value === '' ? null : value), phoneSchema.nullish()),
  zoneIds: zoneIdsSchema,
});

/** US-12 */
export const availabilitySchema = z.object({
  isAvailable: z.boolean({ error: 'Valeur invalide' }),
});
