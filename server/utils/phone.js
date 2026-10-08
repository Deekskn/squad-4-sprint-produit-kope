const COUNTRY_CODE = '242';

export function normalizePhone(input) {
  if (typeof input !== 'string') return null;

  let digits = input.replace(/[\s().-]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith(COUNTRY_CODE) && digits.length === COUNTRY_CODE.length + 9) 
    digits = digits.slice(COUNTRY_CODE.length);
  

  return /^0\d{8}$/.test(digits) ? `+${COUNTRY_CODE}${digits}` : null;
}

/** Lien WhatsApp */
export function toWhatsappUrl(phone) {
  return `https://wa.me/${phone.replace(/\D/g, '')}`;
}
