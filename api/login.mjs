import {
  clearFailures,
  clientIp,
  cookieHeader,
  emailMatches,
  isJsonRequest,
  isRateLimited,
  json,
  originAllowed,
  readJson,
  recordFailure,
} from '../lib/api.mjs'
import { getAuthConfig, SESSION_MAX_AGE } from '../lib/config.mjs'
import { verifyPassword } from '../lib/password.mjs'
import { signSession } from '../lib/session.mjs'

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' })
  if (!originAllowed(request)) return json({ error: 'Cross-origin requests are not allowed.' }, 403)
  if (!isJsonRequest(request)) return json({ error: 'Content-Type must be application/json.' }, 415)

  const { email: configuredEmail, secret } = getAuthConfig()
  if (!configuredEmail || secret.length < 32) return json({ error: 'Server auth is not configured.' }, 500)

  const ip = clientIp(request)
  if (isRateLimited(ip)) return json({ error: 'Too many attempts. Try again in a few minutes.' }, 429)

  let body
  try {
    body = await readJson(request)
  } catch (error) {
    return json({ error: error.message }, 400)
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!emailMatches(email) || !verifyPassword(password)) {
    recordFailure(ip)
    return json({ error: 'Incorrect email or password.' }, 401)
  }

  clearFailures(ip)
  const session = await signSession({ email: configuredEmail, exp: Date.now() + SESSION_MAX_AGE * 1000 })
  return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader(session) })
}
