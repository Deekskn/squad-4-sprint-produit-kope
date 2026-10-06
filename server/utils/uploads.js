import { env } from '../config/env.js';

const cloudBase =
  env.CLOUDINARY_CLOUD_NAME &&
  `https://res.cloudinary.com/${env.CLOUDINARY_CLOUD_NAME}/image/upload/${env.CLOUDINARY_FOLDER}`;

/** Chemin relatif stocké ("12/abc.jpg", "avatars/x.jpg") -> URL publique pour le front. */
export function uploadUrl(relativePath) {
  if (!relativePath) return null;
  return cloudBase ? `${cloudBase}/${relativePath}` : `/uploads/${relativePath}`;
}