import { z } from 'zod';
import { normalizePhone } from './phone.js';

/** Texte obligatoire, sans espaces autour. */
export const requiredText = (max) =>
  z
    .string({ error: 'Ce champ est obligatoire' })
    .trim()
    .min(1, 'Ce champ est obligatoire')
    .max(max, `${max} caractères maximum`);

/** Identifiant numérique (accepte "3" venant d'une URL ou d'un formulaire). */
export const idSchema = (message = 'Identifiant invalide') =>
  z.coerce.number({ error: message }).int(message).positive(message);

/** Numéro de téléphone, normalisé en +242XXXXXXXXX (voir utils/phone.js). */
export const phoneSchema = z
  .string({ error: 'Le numéro de téléphone est obligatoire' })
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizePhone(value);
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Numéro de téléphone invalide' });
      return z.NEVER;
    }
    return normalized;
  });

// bcrypt ignore tout ce qui dépasse 72 octets : on borne explicitement
export const passwordSchema = z
  .string({ error: 'Le mot de passe est obligatoire' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(72, 'Le mot de passe ne doit pas dépasser 72 caractères');

export const consentSchema = z
  .boolean({ error: 'Le consentement est obligatoire' })
  .refine((value) => value === true, 'Le consentement est obligatoire');

/** Liste de zones : au moins une, sans doublon. */
export const zoneIdsSchema = z
  .array(idSchema('Zone invalide'), { error: 'Choisissez au moins une zone' })
  .min(1, 'Choisissez au moins une zone')
  .transform((ids) => [...new Set(ids)]);

export const idParamSchema = z.object({ id: idSchema() });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
});
