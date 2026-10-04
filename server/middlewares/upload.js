import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 Mo (US-05 CA1)
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

/**
 * Réception d'un fichier en mémoire (traité ensuite par sharp).
 * Usage : upload.single('photo')
 * Le type MIME envoyé par le navigateur est vérifié ici, puis le contenu réel
 * est revérifié par sharp dans photos.storage.js.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest('Format non supporté : JPG ou PNG uniquement', {
      photo: 'Format non supporté : JPG ou PNG uniquement',
    }));
  },
});
