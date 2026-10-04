const COUNTRY_CODE = '242';

/**
 * Normalise un numéro congolais au format +242XXXXXXXXX.
 * Accepte : "06 123 45 67", "+242 06 123 45 67", "00242061234567", "242061234567".
 * Retourne null si le numéro est invalide.
 *
 * ⚠ Hypothèse à confirmer avec le PM : numéro à 9 chiffres commençant par 0
 * (le 0 initial fait partie du numéro congolais). Toute la plateforme passe par
 * cette fonction : si la règle change, on ne la corrige qu'ici.
 */
export function normalizePhone(input) {
  if (typeof input !== 'string') return null;

  let digits = input.replace(/[\s().-]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith(COUNTRY_CODE) && digits.length === COUNTRY_CODE.length + 9) {
    digits = digits.slice(COUNTRY_CODE.length);
  }

  return /^0\d{8}$/.test(digits) ? `+${COUNTRY_CODE}${digits}` : null;
}

/** Lien WhatsApp (format international, sans "+") : https://wa.me/242061234567 */
export function toWhatsappUrl(phone) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}
