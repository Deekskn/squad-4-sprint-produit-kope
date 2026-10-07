const PG_ERRORS = {
  '23505': [409, 'Cette valeur existe déjà'],               
  '23503': [400, 'Référence invalide (métier, zone…)'],    
  '23514': [400, 'Données invalides'],                      
};
export function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.status ?? 500;
  let message = err.message;
  let errors = err.errors;
  if (err.code === 'LIMIT_FILE_SIZE') {
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
  } else if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'ECONNRESET' ||
    err.code === 'ETIMEDOUT' ||
    /timeout expired/i.test(String(err.message ?? ''))
  ) {
    status = 503;
    message = 'Base de données indisponible';
    errors = undefined;
  } else if (PG_ERRORS[err.code]) 
    [status, message] = PG_ERRORS[err.code];
  
  if (status >= 500) {
    console.error(err);
    if (status !== 503) {
      message = 'Erreur interne du serveur';
      errors = undefined;
    }
  }
  res.status(status).json({ message, ...(errors && { errors }) });
}
