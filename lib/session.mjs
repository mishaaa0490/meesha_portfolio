import { createHmac, timingSafeEqual } from 'node:crypto'
import { COOKIE_NAME, getAuthConfig } from './config.mjs'

function safeEqual(left, right) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function signSession(payload) {
  const { secret } = getAuthConfig()
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.')
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', secret).update(data).digest('base64url')
  return `${data}.${signature}`
}

export async function readSessionFromCookie(cookieHeader) {
  const { email, secret } = getAuthConfig()
  const value = (cookieHeader || '')
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === COOKIE_NAME)?.[1]

  if (!value || secret.length < 32 || !email) return null

  const [data, signature] = value.split('.')
  if (!data || !signature) return null

  const expected = createHmac('sha256', secret).update(data).digest('base64url')
  if (!safeEqual(signature, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (payload.email !== email || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}
