// Erreurs Postgres courantes -> réponse HTTP propre
const PG_ERRORS = {
  '23505': [409, 'Cette valeur existe déjà'],               // unique_violation
  '23503': [400, 'Référence invalide (métier, zone…)'],    // foreign_key_violation
  '23514': [400, 'Données invalides'],                      // check_violation
};

// Les 4 paramètres sont obligatoires : c'est ce qui fait reconnaître un middleware d'erreur à Express.

// Erreurs de connexion/pool : la DB est indisponible -> 503 explicite
const DB_UNAVAILABLE = [
  'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', '57P01', '57P02', '57P03', '08006', '08001',
];

export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.status ?? 500;
  let message = err.message;
  let errors = err.errors;

  if (
    DB_UNAVAILABLE.includes(err.code) ||
    err.code === 'ETIMEDOUT' ||
    err.message === 'timeout expired' ||
    err.message?.includes('Connection terminated') ||
    err.message?.includes('Connection timeout') ||
    err.message?.includes('timeout of')
  ) {
    status = 503;
    message = 'Base de données indisponible, réessayez plus tard';
    errors = undefined;
  } else if (err.code === 'LIMIT_FILE_SIZE') {
    status = 400;
    message = 'La photo dépasse 5 Mo';
    errors = { photo: message };
  } else if (err.code === 'LIMIT_UNEXPECTED_FILE' || err.code === 'LIMIT_FILE_COUNT') {
    status = 400;
    message = 'Envoyez une seule photo dans le champ "photo"';
    errors = { photo: message };
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    message = 'JSON invalide';
  } else if (PG_ERRORS[err.code]) {
    [status, message] = PG_ERRORS[err.code];
  }

  if (status >= 500) {
    console.error(err);
    if (status !== 503) {
      message = 'Erreur interne du serveur';
      errors = undefined;
    }
  }

  res.status(status).json({ message, ...(errors && { errors }) });
}
