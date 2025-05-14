import crypto from 'crypto';

/**
 * Generates a secure random token for password reset purposes.
 *
 * @returns {string} A hexadecimal string representation of a 40-byte random token.
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generates an expiry time based on the current date and time.
 *
 * @param hours - The number of hours to add to the current time to calculate the expiry time. Defaults to 1 hour.
 * @returns A `Date` object representing the calculated expiry time.
 */
export function generateExpiryTime(hours = 1): Date {
  return new Date(Date.now() + hours * 60 * 60 * 1000);
}