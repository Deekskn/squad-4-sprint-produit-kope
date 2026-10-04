export function normalizePhone(raw) {
  if (raw == null) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('00242')) return `+242${digits.slice(5)}`;
  if (digits.startsWith('242')) return `+${digits}`;
  if (digits.startsWith('+')) {
    const d = digits.slice(1);
    if (d.startsWith('242')) return `+${d}`;
    return null;
  }

  if (digits.length === 9 && digits.startsWith('0')) return `+242${digits.slice(1)}`;
  if (digits.length === 8) return `+242${digits}`;
  if (digits.length === 10 && digits.startsWith('0')) return digits;
  if (digits.length >= 9) return `+242${digits.slice(-9)}`;
  return null;
}

export function isPhoneValid(raw) {
  return Boolean(normalizePhone(raw));
}
