export const COOKIE_NAME = 'misha_admin'
export const SESSION_MAX_AGE = 60 * 60 * 8

export function getAuthConfig() {
  return {
    email: (process.env.ADMIN_EMAIL || '').trim().toLowerCase(),
    hash: (process.env.ADMIN_PASSWORD_HASH || '').trim(),
    secret: process.env.SESSION_SECRET || '',
  }
}

export function isCookieSecure() {
  if (process.env.COOKIE_SECURE === 'true') return true
  if (process.env.COOKIE_SECURE === 'false') return false
  return process.env.VERCEL === '1'
}
