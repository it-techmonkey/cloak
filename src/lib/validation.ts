/**
 * Shared validation for email + phone fields. Pure functions with no server-only
 * imports, so the same rules run on the client (instant feedback) and on the
 * server (the authoritative check). Keep these in lockstep with PhoneInput.
 */

// A pragmatic email shape check: one local part, one @, a dotted domain with a
// 2+ char TLD. Deliberately not RFC-perfect — that rejects valid addresses and
// accepts unroutable ones. Delivery is the real validator.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length <= 254 && EMAIL_PATTERN.test(trimmed);
}

/** Digits only, with a single leading national-trunk zero stripped. */
export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "").replace(/^0+/, "");
}

/**
 * Known dial codes and how many *national* significant digits a real number
 * has for that country. Counting the national part (not the combined value)
 * stops short numbers from slipping through just because a long dial code like
 * "+971" pads the total over a global minimum. Ranges are inclusive.
 */
const DIAL_RULES: Array<{ dial: string; min: number; max: number }> = [
  { dial: "+44", min: 9, max: 10 }, // UK
  { dial: "+353", min: 7, max: 9 }, // Ireland
  { dial: "+1", min: 10, max: 10 }, // US / Canada (NANP)
  { dial: "+33", min: 9, max: 9 }, // France
  { dial: "+49", min: 6, max: 11 }, // Germany
  { dial: "+34", min: 9, max: 9 }, // Spain
  { dial: "+39", min: 9, max: 10 }, // Italy
  { dial: "+31", min: 9, max: 9 }, // Netherlands
  { dial: "+351", min: 9, max: 9 }, // Portugal
  { dial: "+48", min: 9, max: 9 }, // Poland
  { dial: "+61", min: 9, max: 9 }, // Australia
  { dial: "+971", min: 8, max: 9 }, // UAE
  { dial: "+91", min: 10, max: 10 }, // India
];

// Longest dial codes first so "+1" doesn't shadow "+1..." patterns badly, and
// "+353" wins over "+3" style prefixes.
const DIAL_RULES_BY_LENGTH = [...DIAL_RULES].sort((a, b) => b.dial.length - a.dial.length);

/**
 * Validate an E.164-style value (e.g. "+447700900000"). When the dial code is
 * recognised we check the national part against that country's real length;
 * otherwise we fall back to the global E.164 range (national part 4–15 digits).
 */
export function isValidPhone(value: string): boolean {
  const trimmed = value.trim();
  const allDigits = trimmed.replace(/\D/g, "");

  // Total E.164 length can never exceed 15 digits (incl. country code).
  if (allDigits.length < 5 || allDigits.length > 15) return false;

  if (trimmed.startsWith("+")) {
    const rule = DIAL_RULES_BY_LENGTH.find((r) => trimmed.startsWith(r.dial));
    if (rule) {
      const national = allDigits.slice(rule.dial.length - 1); // dial sans "+"
      return national.length >= rule.min && national.length <= rule.max;
    }
  }

  // Unknown/absent dial code: require a plausible national number.
  return allDigits.length >= 7 && allDigits.length <= 15;
}

/** Returns an error message for an email field, or null when it's valid. */
export function emailError(value: string, { required = true } = {}): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Please enter an email address." : null;
  if (!isValidEmail(trimmed)) return "Please enter a valid email address.";
  return null;
}

/** Returns an error message for a phone field, or null when it's valid. */
export function phoneError(value: string, { required = true } = {}): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Please enter a mobile number." : null;
  if (!isValidPhone(trimmed)) return "Please enter a valid mobile number.";
  return null;
}
