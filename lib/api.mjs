import { COOKIE_NAME, SESSION_MAX_AGE, isCookieSecure } from './config.mjs'
import { safeEqual } from './password.mjs'

const MAX_BODY_BYTES = 2_500_000
const LOGIN_WINDOW_MS = 10 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5
const loginAttempts = new Map()
const encoder = new TextEncoder()

export function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      ...headers,
    },
  })
}

export function isJsonRequest(request) {
  return String(request.headers.get('content-type') || '').startsWith('application/json')
}

export async function readJson(request) {
  const text = await request.text()
  if (encoder.encode(text).length > MAX_BODY_BYTES) throw new Error('Request body too large.')
  try {
    return text ? JSON.parse(text) : {}
  } catch {
    throw new Error('Invalid JSON body.')
  }
}

export function originAllowed(request) {
  const origin = request.headers.get('origin')
  if (!origin) return true
  try {
    return new URL(origin).host === request.headers.get('host')
  } catch {
    return false
  }
}

export function clientIp(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
}

export function cookieHeader(value, maxAge = SESSION_MAX_AGE) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]
  if (isCookieSecure()) parts.push('Secure')
  return parts.join('; ')
}

export function hasUnsafeKeys(value) {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(hasUnsafeKeys)
  return Object.entries(value).some(([key, child]) => {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) return true
    return hasUnsafeKeys(child)
  })
}

export function isRateLimited(ip) {
  const now = Date.now()
  const recent = (loginAttempts.get(ip) || []).filter((time) => now - time < LOGIN_WINDOW_MS)
  loginAttempts.set(ip, recent)
  return recent.length >= LOGIN_MAX_ATTEMPTS
}

export function recordFailure(ip) {
  const recent = loginAttempts.get(ip) || []
  loginAttempts.set(ip, [...recent, Date.now()])
}

export function clearFailures(ip) {
  loginAttempts.delete(ip)
}

export function emailMatches(email) {
  return safeEqual(email, (process.env.ADMIN_EMAIL || '').trim().toLowerCase())
}
