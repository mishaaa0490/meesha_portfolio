import {
  clearFailures,
  clientIp,
  cookieHeader,
  emailMatches,
  isJsonRequest,
  isRateLimited,
  originAllowed,
  readJson,
  recordFailure,
  sendJson,
} from '../lib/api.mjs'
import { getAuthConfig, SESSION_MAX_AGE } from '../lib/config.mjs'
import { verifyPassword } from '../lib/password.mjs'
import { signSession } from '../lib/session.mjs'

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' }, { Allow: 'POST' })
  if (!originAllowed(request)) return sendJson(response, 403, { error: 'Cross-origin requests are not allowed.' })
  if (!isJsonRequest(request)) return sendJson(response, 415, { error: 'Content-Type must be application/json.' })

  const { email: configuredEmail, secret } = getAuthConfig()
  if (!configuredEmail || secret.length < 32) return sendJson(response, 500, { error: 'Server auth is not configured.' })

  const ip = clientIp(request)
  if (isRateLimited(ip)) return sendJson(response, 429, { error: 'Too many attempts. Try again in a few minutes.' })

  let body
  try {
    body = await readJson(request)
  } catch (error) {
    return sendJson(response, 400, { error: error.message })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const password = typeof body.password === 'string' ? body.password : ''

  if (!emailMatches(email) || !verifyPassword(password)) {
    recordFailure(ip)
    return sendJson(response, 401, { error: 'Incorrect email or password.' })
  }

  clearFailures(ip)
  const session = signSession({ email: configuredEmail, exp: Date.now() + SESSION_MAX_AGE * 1000 })
  return sendJson(response, 200, { ok: true }, { 'Set-Cookie': cookieHeader(session) })
}
