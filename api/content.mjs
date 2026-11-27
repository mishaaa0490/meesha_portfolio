import { hasUnsafeKeys, isJsonRequest, json, originAllowed, readJson } from '../lib/api.mjs'
import { readContent, writeContent } from '../lib/content-store.mjs'
import { readSessionFromCookie } from '../lib/session.mjs'

export default async function handler(request) {
  if (request.method === 'GET') return json(await readContent())
  if (request.method !== 'PUT') return json({ error: 'Method not allowed.' }, 405, { Allow: 'GET, PUT' })
  if (!originAllowed(request)) return json({ error: 'Cross-origin requests are not allowed.' }, 403)
  if (!isJsonRequest(request)) return json({ error: 'Content-Type must be application/json.' }, 415)

  const session = await readSessionFromCookie(request.headers.get('cookie'))
  if (!session) return json({ error: 'Sign in to change content.' }, 401)

  let body
  try {
    body = await readJson(request)
  } catch (error) {
    return json({ error: error.message }, 400)
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) || hasUnsafeKeys(body)) {
    return json({ error: 'Invalid content payload.' }, 400)
  }

  try {
    await writeContent(body)
  } catch {
    return json({ error: 'Unable to save content.' }, 500)
  }

  return json({ ok: true })
}
