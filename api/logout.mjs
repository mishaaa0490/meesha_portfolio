import { cookieHeader, originAllowed, sendJson } from '../lib/api.mjs'

export default async function handler(request, response) {
  if (request.method !== 'POST') return sendJson(response, 405, { error: 'Method not allowed.' }, { Allow: 'POST' })
  if (!originAllowed(request)) return sendJson(response, 403, { error: 'Cross-origin requests are not allowed.' })
  return sendJson(response, 200, { ok: true }, { 'Set-Cookie': cookieHeader('', 0) })
}
