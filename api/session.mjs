import { json } from '../lib/api.mjs'
import { readSessionFromCookie } from '../lib/session.mjs'

export default async function handler(request) {
  const session = await readSessionFromCookie(request.headers.get('cookie'))
  return json({ authenticated: Boolean(session), email: session?.email ?? null })
}
