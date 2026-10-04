import { z } from 'zod';
import { ApiError } from '../utils/ApiError.js';

/**
 * Valide req[source] avec un schéma Zod. Le résultat nettoyé (types convertis, valeurs
 * par défaut, numéros normalisés) est dans req.validated[source].
 *
 * Express 5 : req.query est en lecture seule, on ne peut donc pas le réécrire,
 * d'où req.validated.
 *
 * En cas d'erreur : 400 { message, errors: { champ: "premier message" } }
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      const errors = Object.fromEntries(
        Object.entries(fieldErrors).map(([field, messages]) => [field, messages[0]]),
      );
      throw new ApiError(400, 'Données invalides', errors);
    }

    req.validated ??= {};
    req.validated[source] = result.data;
    next();
  };
}
