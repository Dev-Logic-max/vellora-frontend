/**
 * Small client-side generators for the employee creation modal.
 * - Unique ID: uppercase, total 6–7 alphanumerics with a dash AFTER the 3rd
 *   char (e.g. `ABC-123`, `ABC-1234`). Always uppercase for consistency.
 * - Password: a readable strong password the admin can keep, edit, or
 *   regenerate.
 */

const ALPHANUM = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

function pick(set: string, n: number): string {
  let out = "";
  const arr = new Uint32Array(n);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) crypto.getRandomValues(arr);
  for (let i = 0; i < n; i++) {
    const r = arr[i] ?? Math.floor(Math.random() * set.length);
    out += set[r % set.length];
  }
  return out;
}

/**
 * Generates a unique code: 3 chars, a dash, then 3 or 4 chars (total 6–7
 * excluding the dash). Uppercase.
 */
export function generateUniqueId(): string {
  const tailLen = Math.random() < 0.5 ? 3 : 4;
  return `${pick(ALPHANUM, 3)}-${pick(ALPHANUM, tailLen)}`;
}

/**
 * Normalizes user-typed input to the allowed shape: uppercase, alphanumerics
 * only, dash auto-placed after the 3rd char, capped at 7 alphanumerics.
 */
export function normalizeUniqueId(raw: string): string {
  const clean = raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
  if (clean.length <= 3) return clean;
  return `${clean.slice(0, 3)}-${clean.slice(3)}`;
}

/** True when a code is a valid 3-(3|4) uppercase unique id. */
export function isValidUniqueId(code: string): boolean {
  return /^[A-Z0-9]{3}-[A-Z0-9]{3,4}$/.test(code);
}

/** Store code: a plain 6-digit numeric code (e.g. `482915`). */
export function generateStoreCode(): string {
  return pick("0123456789", 6);
}

const PW_UPPER = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const PW_LOWER = "abcdefghijkmnpqrstuvwxyz";
const PW_NUM = "23456789";
const PW_SYM = "!@#$%&*?";

/** Generates a 12-char password with mixed case, a digit, and a symbol. */
export function generatePassword(): string {
  const base = [
    pick(PW_UPPER, 1),
    pick(PW_LOWER, 1),
    pick(PW_NUM, 1),
    pick(PW_SYM, 1),
    pick(PW_UPPER + PW_LOWER + PW_NUM, 8),
  ].join("");
  // Shuffle so the guaranteed classes aren't always in front.
  return base
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}
