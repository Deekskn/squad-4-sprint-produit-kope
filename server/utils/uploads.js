/** Transforme un chemin relatif stocké en base en URL publique (servie par express.static). */
export function uploadUrl(relativePath) {
  return relativePath ? `/uploads/${relativePath}` : null;
}
