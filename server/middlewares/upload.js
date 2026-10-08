import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
const MAX_FILE_SIZE = 5 * 1024 * 1024; 
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter(req, file, cb) {
    if (ALLOWED_TYPES.includes(file.mimetype)) return cb(null, true);
    cb(ApiError.badRequest('Format non supporté : JPG ou PNG uniquement', {
      [file.fieldname || 'photo']: 'Format non supporté : JPG ou PNG uniquement',
    }));
  },
});
