/**
 * JWT Utilities
 * Decode JWT tokens without verification (client-side only)
 */

/**
 * Decode JWT payload without verification
 * @param {string} token - JWT token
 * @returns {object|null} - Decoded payload or null if invalid
 */
export function decodeJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 * @param {string} token - JWT token
 * @returns {boolean} - True if expired
 */
export function isTokenExpired(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

/**
 * Get time until JWT token expiration in milliseconds
 * @param {string} token - JWT token
 * @returns {number|null} - Milliseconds until expiry or null if invalid
 */
export function getTimeUntilExpiry(token) {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) return null;

  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = payload.exp - now;
  return secondsUntilExpiry > 0 ? secondsUntilExpiry * 1000 : 0;
}
