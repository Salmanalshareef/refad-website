import "server-only";

/**
 * Saudi mobile numbers in the canonical local form the database stores:
 * 05XXXXXXXX.
 *
 * Members type their number several ways — 05…, 5…, 966…, +966… — and the
 * lookups that find an account compare strings exactly. Without normalising,
 * a registered member entering +966 5… simply is not found, which on the
 * password reset form is indistinguishable from not having an account at all.
 */
export function normalizeLocalPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("966")) return `0${digits.slice(3)}`;
  if (digits.startsWith("0")) return digits;
  if (digits.length === 9 && digits.startsWith("5")) return `0${digits}`;
  return digits;
}
