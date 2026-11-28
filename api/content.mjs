import { hasUnsafeKeys, isJsonRequest, originAllowed, readJson, sendJson } from '../lib/api.mjs'
import { explainBlobError, readContent, writeContent } from '../lib/content-store.mjs'
import { readSessionFromCookie } from '../lib/session.mjs'

export default async function handler(request, response) {
  if (request.method === 'GET') return sendJson(response, 200, await readContent())
  if (request.method !== 'PUT') return sendJson(response, 405, { error: 'Method not allowed.' }, { Allow: 'GET, PUT' })
  if (!originAllowed(request)) return sendJson(response, 403, { error: 'Cross-origin requests are not allowed.' })
  if (!isJsonRequest(request)) return sendJson(response, 415, { error: 'Content-Type must be application/json.' })

  const session = await readSessionFromCookie(request.headers.cookie)
  if (!session) return sendJson(response, 401, { error: 'Sign in to change content.' })

  let body
  try {
    body = await readJson(request)
  } catch (error) {
    return sendJson(response, 400, { error: error.message })
  }

  if (!body || typeof body !== 'object' || Array.isArray(body) || hasUnsafeKeys(body)) {
    return sendJson(response, 400, { error: 'Invalid content payload.' })
  }

  try {
    await writeContent(body)
  } catch (error) {
    console.error('[api/content] Failed to save content:', error)
    return sendJson(response, 500, { error: 'Unable to save content.', detail: explainBlobError(error) })
  }

  return sendJson(response, 200, { ok: true })
}
