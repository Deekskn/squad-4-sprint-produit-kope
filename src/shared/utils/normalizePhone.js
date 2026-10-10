export function normalizePhone(raw) {
  if (raw == null) return null;
  let digits = String(raw).replace(/[\s().-]/g, '');

  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.startsWith('242') && digits.length === 12) digits = digits.slice(3);

  if (!/^0\d{8}$/.test(digits)) return null;
  return `+242${digits}`;
}

export function isPhoneValid(raw) {
  return Boolean(normalizePhone(raw));
}
