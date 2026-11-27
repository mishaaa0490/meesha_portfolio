import { cookieHeader, json, originAllowed } from '../lib/api.mjs'

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed.' }, 405, { Allow: 'POST' })
  if (!originAllowed(request)) return json({ error: 'Cross-origin requests are not allowed.' }, 403)
  return json({ ok: true }, 200, { 'Set-Cookie': cookieHeader('', 0) })
}
