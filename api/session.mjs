import { sendJson } from '../lib/api.mjs'
import { readSessionFromCookie } from '../lib/session.mjs'

export default async function handler(request, response) {
  const session = await readSessionFromCookie(request.headers.cookie)
  sendJson(response, 200, { authenticated: Boolean(session), email: session?.email ?? null })
}
