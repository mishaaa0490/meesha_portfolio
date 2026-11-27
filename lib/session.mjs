import { COOKIE_NAME, getAuthConfig } from './config.mjs'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

function base64UrlEncode(bytes) {
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4)
  const binary = atob(padded)
  return Uint8Array.from(binary, (character) => character.charCodeAt(0))
}

function getCookie(cookieHeader, name) {
  return (cookieHeader || '')
    .split(';')
    .map((part) => part.trim().split('='))
    .find(([key]) => key === name)?.[1]
}

async function importKey(secret) {
  return crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'])
}

export async function signSession(payload) {
  const { secret } = getAuthConfig()
  if (secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters.')
  const data = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  const signature = base64UrlEncode(new Uint8Array(await crypto.subtle.sign('HMAC', await importKey(secret), encoder.encode(data))))
  return `${data}.${signature}`
}

export async function readSessionFromCookie(cookieHeader) {
  const { email, secret } = getAuthConfig()
  const value = getCookie(cookieHeader, COOKIE_NAME)
  if (!value || secret.length < 32 || !email) return null

  const parts = value.split('.')
  if (parts.length !== 2) return null
  const [data, signature] = parts

  const valid = await crypto.subtle.verify('HMAC', await importKey(secret), base64UrlDecode(signature), encoder.encode(data))
  if (!valid) return null

  try {
    const payload = JSON.parse(decoder.decode(base64UrlDecode(data)))
    if (payload.email !== email || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}
