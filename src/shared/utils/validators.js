import { z } from 'zod';
import { normalizePhone } from './normalizePhone.js';

const MAX_PASSWORD = 72;
const CONSENT_REQUIRED = 'Le consentement est obligatoire';

const phoneSchema = z
  .string({ error: 'Le numéro de téléphone est obligatoire' })
  .trim()
  .transform((v, ctx) => {
    const n = normalizePhone(v);
    if (!n) {
      ctx.addIssue({ code: 'custom', message: 'Numéro de téléphone invalide' });
      return z.NEVER;
    }
    return n;
  });

const passwordSchema = z
  .string({ error: 'Le mot de passe est obligatoire' })
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .max(MAX_PASSWORD, `Le mot de passe ne doit pas dépasser ${MAX_PASSWORD} caractères`);

const consentSchema = z
  .boolean({ error: CONSENT_REQUIRED })
  .refine((v) => v === true, CONSENT_REQUIRED);

const requiredText = (max, message = 'Ce champ est obligatoire') =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `${max} caractères maximum`);

const idSchema = (message = 'Identifiant invalide') =>
  z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z.number({ error: message }).int(message).positive(message),
  );

const zoneIdsSchema = z.preprocess(
  (v) => {
    if (Array.isArray(v)) return v;
    if (v == null || v === '') return [];
    return [v];
  },
  z
    .array(idSchema('Zone invalide'), { error: 'Choisissez au moins une zone' })
    .min(1, 'Choisissez au moins une zone')
    .transform((arr) => [...new Set(arr.map((n) => Number(n)))]),
);

export const loginSchema = z.object({
  phone: z.string({ error: 'Champ obligatoire' }).trim().min(1, 'Champ obligatoire'),
  password: z.string({ error: 'Champ obligatoire' }).min(1, 'Champ obligatoire'),
});

export const registerClientSchema = z.object({
  firstName: requiredText(100, 'Le prénom est obligatoire'),
  lastName: requiredText(100, 'Le nom est obligatoire'),
  phone: phoneSchema,
  password: passwordSchema,
  consent: consentSchema,
});

export const registerProfessionalSchema = z.object({
  displayName: requiredText(100, 'Le nom affiché est obligatoire'),
  phone: phoneSchema,
  password: passwordSchema,
  tradeId: idSchema('Choisissez un métier'),
  zoneIds: zoneIdsSchema,
  consent: consentSchema,
});

export const updateProfileSchema = z.object({
  displayName: requiredText(100, 'Le nom affiché est obligatoire'),
  tradeId: idSchema('Choisissez un métier'),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(30, 'La description doit contenir au moins 30 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
  yearsExperience: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z
      .number({ error: "Indiquez vos années d'expérience" })
      .int("Indiquez un nombre entier d'années")
      .min(0, "Les années d'expérience doivent être comprises entre 0 et 60")
      .max(60, "Les années d'expérience doivent être comprises entre 0 et 60"),
  ),
  whatsapp: z.preprocess(
    (v) => (v === '' ? null : v),
    z
      .string()
      .trim()
      .transform((v, ctx) => {
        if (v == null || v === '') return null;
        const n = normalizePhone(v);
        if (!n) {
          ctx.addIssue({ code: 'custom', message: 'Numéro WhatsApp invalide' });
          return z.NEVER;
        }
        return n;
      })
      .nullish(),
  ),
  zoneIds: zoneIdsSchema,
});

export const createReviewSchema = z.object({
  rating: z.preprocess(
    (v) => Number(v),
    z
      .number({ error: 'La note est obligatoire' })
      .int('La note doit être un entier entre 1 et 5')
      .min(1, 'La note doit être comprise entre 1 et 5')
      .max(5, 'La note doit être comprise entre 1 et 5'),
  ),
  comment: z.preprocess(
    (v) => (v === '' || v == null ? null : String(v).trim().slice(0, 300)),
    z.string().nullish(),
  ),
});

export const createContactSchema = z.object({
  toUserId: z.coerce
    .number({ error: 'Choisissez un interlocuteur' })
    .int('Identifiant invalide')
    .positive('Identifiant invalide'),
  message: z
    .string({ error: 'Le message est obligatoire' })
    .trim()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(500, 'Le message ne doit pas dépasser 500 caractères'),
});

export const becomeProfessionalSchema = z.object({
  displayName: requiredText(100, "Le nom affiché est obligatoire"),
  tradeId: idSchema('Choisissez un métier'),
  zoneIds: zoneIdsSchema,
  yearsExperience: z.preprocess(
    (v) => (v === '' || v == null ? undefined : Number(v)),
    z
      .number({ error: "Indiquez vos années d'expérience" })
      .int("Indiquez un nombre entier d'années")
      .min(0, "Les années d'expérience doivent être comprises entre 0 et 60")
      .max(60, "Les années d'expérience doivent être comprises entre 0 et 60"),
  ),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(30, 'La description doit contenir au moins 30 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
});

export const addPhotoSchema = z.object({
  title: requiredText(100, 'Le titre est obligatoire').refine((v) => v.length >= 3, 'Le titre doit contenir au moins 3 caractères'),
  description: z
    .string({ error: 'La description est obligatoire' })
    .trim()
    .min(10, 'La description doit contenir au moins 10 caractères')
    .max(500, 'La description ne doit pas dépasser 500 caractères'),
});

export function validateFrontend(schema, values) {
  const res = schema.safeParse(values);
  if (res.success) return { success: true, data: res.data, errors: {} };
  const fieldErrors = Object.fromEntries(
    Object.entries(z.flattenError(res.error).fieldErrors || {}).map(([k, msgs]) => [
      k,
      Array.isArray(msgs) ? msgs[0] : msgs,
    ]),
  );
  return { success: false, data: null, errors: fieldErrors };
}
