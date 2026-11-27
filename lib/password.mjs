import { scryptSync, timingSafeEqual } from 'node:crypto'
import { getAuthConfig } from './config.mjs'

export function safeEqual(left, right) {
  const a = Buffer.from(String(left))
  const b = Buffer.from(String(right))
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export function verifyPassword(password) {
  const { hash } = getAuthConfig()
  try {
    const [scheme, saltHex, hashHex] = hash.split('$')
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
    const expected = Buffer.from(hashHex, 'hex')
    if (expected.length !== 64) return false
    const actual = scryptSync(String(password), Buffer.from(saltHex, 'hex'), expected.length)
    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}
