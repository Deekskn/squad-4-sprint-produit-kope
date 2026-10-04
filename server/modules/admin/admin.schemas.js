import { z } from 'zod';

/** Masquer (true) ou réactiver (false) un profil ou un avis. */
export const visibilitySchema = z.object({
  hidden: z.boolean({ error: 'Valeur invalide' }),
});
