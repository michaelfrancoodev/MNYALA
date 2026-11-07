/**
 * Turns the ways people write a phone number into E.164 ("+255758730108"), or null if it is not a phone number.
 * Accepts: 0758 730 108, 0758-730-108, +255 758 730 108, 255758730108, 758730108, 00255758730108,
 * and other countries in +<country><number> form (8 to 15 digits).
 */
export function normalizePhone(input: string): string | null {
  const raw = input.trim();
  if (raw === "") return null;
  if (!/^[+\d\s().-]+$/.test(raw)) return null;
  // A plus sign is only meaningful as the very first character.
  if (raw.lastIndexOf("+") > 0 || (raw.match(/\+/g)?.length ?? 0) > 1) return null;
  const hasPlus = raw.startsWith("+");
  const digits = raw.replace(/\D/g, "");
  if (digits === "") return null;

  // Tanzania has a fixed length (+255 and nine digits), so check it strictly; other countries by the general E.164 rule.
  const international = (d: string) => (d.startsWith("255") ? /^255[1-9]\d{8}$/.test(d) : /^[1-9]\d{7,14}$/.test(d)) ? `+${d}` : null;
  if (hasPlus) return international(digits);
  if (digits.startsWith("00")) return international(digits.slice(2));
  if (digits.startsWith("255")) return /^255[1-9]\d{8}$/.test(digits) ? `+${digits}` : null;
  if (digits.startsWith("0")) return /^0[1-9]\d{8}$/.test(digits) ? `+255${digits.slice(1)}` : null;
  if (/^[1-9]\d{8}$/.test(digits)) return `+255${digits}`;
  return null;
}
