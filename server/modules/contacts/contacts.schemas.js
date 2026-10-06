import { z } from 'zod';
import { idSchema } from '../../utils/commonSchemas.js';

/**
 * US-17 : prise de contact. Le destinataire est un client ou un professionnel
 * (les deux rôles peuvent contacter), le message est obligatoire (10 à 500 caractères).
 */
export const createContactSchema = z.object({
  toUserId: idSchema('Identifiant invalide'),
  message: z
    .string({ error: 'Le message est obligatoire' })
    .trim()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(500, 'Le message ne doit pas dépasser 500 caractères'),
});
