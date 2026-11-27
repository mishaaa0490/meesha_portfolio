import {
  createHmac,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto'
import {
  createReadStream,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const distDir = join(root, 'dist')
const dataDir = join(root, 'data')
const contentFile = join(dataDir, 'content.json')
const envFile = join(root, '.env.server')

function loadEnv() {
  if (!existsSync(envFile)) return
  const lines = readFileSync(envFile, 'utf8').split(/\r?\n/)
  lines.forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const separator = trimmed.indexOf('=')
    if (separator === -1) return
    const key = trimmed.slice(0, separator).trim()
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '')
    if (!(key in process.env)) process.env[key] = value
  })
}

loadEnv()

const PORT = Number(process.env.PORT || 3000)
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase()
const PASSWORD_HASH = (process.env.ADMIN_PASSWORD_HASH || '').trim()
const SESSION_SECRET = process.env.SESSION_SECRET || ''
const COOKIE_NAME = 'misha_admin'
const SESSION_MAX_AGE = 60 * 60 * 8
const COOKIE_SECURE = (process.env.COOKIE_SECURE || (process.env.NODE_ENV === 'production' ? 'true' : 'false')) === 'true'
const MAX_BODY_BYTES = 2_500_000
const LOGIN_WINDOW_MS = 10 * 60 * 1000
const LOGIN_MAX_ATTEMPTS = 5

if (!ADMIN_EMAIL || !PASSWORD_HASH || SESSION_SECRET.length < 32) {
  console.error('Missing server auth config. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET (32+ chars) in .env.server')
  process.exit(1)
}

mkdirSync(dataDir, { recursive: true })
if (!existsSync(contentFile)) writeFileSync(contentFile, '{}\n', 'utf8')

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
}

const loginAttempts = new Map()

function safeEqual(left, right) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

function verifyPassword(password) {
  try {
    const [scheme, saltHex, hashHex] = PASSWORD_HASH.split('$')
    if (scheme !== 'scrypt' || !saltHex || !hashHex) return false
    const expected = Buffer.from(hashHex, 'hex')
    if (expected.length !== 64) return false
    const actual = scryptSync(password, Buffer.from(saltHex, 'hex'), expected.length)
    return timingSafeEqual(actual, expected)
  } catch {
    return false
  }
}

function signSession(payload) {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
  return `${data}.${signature}`
}

function readSession(request) {
  const cookies = (request.headers.cookie || '')
    .split(';')
    .map((part) => part.trim().split('='))
  const entry = cookies.find(([key]) => key === COOKIE_NAME)
  if (!entry || !entry[1]) return null

  const [data, signature] = entry[1].split('.')
  if (!data || !signature) return null
  const expected = createHmac('sha256', SESSION_SECRET).update(data).digest('base64url')
  if (!safeEqual(signature, expected)) return null

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'))
    if (payload.email !== ADMIN_EMAIL || typeof payload.exp !== 'number' || payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

function cookieHeader(value, maxAge) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ]
  if (COOKIE_SECURE) parts.push('Secure')
  return parts.join('; ')
}

function sendJson(response, status, body, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  })
  response.end(JSON.stringify(body))
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    request.on('data', (chunk) => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) {
        reject(new Error('Request body too large'))
        request.destroy()
        return
      }
      chunks.push(chunk)
    })
    request.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8')
        resolve(text ? JSON.parse(text) : {})
      } catch {
        reject(new Error('Invalid JSON body'))
      }
    })
    request.on('error', reject)
  })
}

function originAllowed(request) {
  const origin = request.headers.origin
  if (!origin) return true
  try {
    return new URL(origin).host === request.headers.host
  } catch {
    return false
  }
}

function clientIp(request) {
  return request.socket.remoteAddress || 'unknown'
}

function rateLimited(ip) {
  const now = Date.now()
  const recent = (loginAttempts.get(ip) || []).filter((time) => now - time < LOGIN_WINDOW_MS)
  loginAttempts.set(ip, recent)
  return recent.length >= LOGIN_MAX_ATTEMPTS
}

function recordFailure(ip) {
  const recent = loginAttempts.get(ip) || []
  loginAttempts.set(ip, [...recent, Date.now()])
}

function clearFailures(ip) {
  loginAttempts.delete(ip)
}

function hasUnsafeKeys(value) {
  if (!value || typeof value !== 'object') return false
  if (Array.isArray(value)) return value.some(hasUnsafeKeys)
  return Object.entries(value).some(([key, child]) => {
    if (['__proto__', 'constructor', 'prototype'].includes(key)) return true
    return hasUnsafeKeys(child)
  })
}

function readContent() {
  try {
    return JSON.parse(readFileSync(contentFile, 'utf8'))
  } catch {
    return {}
  }
}

function writeContent(content) {
  const temporary = `${contentFile}.tmp`
  writeFileSync(temporary, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
  renameSync(temporary, contentFile)
}

async function handleApi(request, response, pathname) {
  const method = request.method || 'GET'

  if (pathname === '/api/session' && method === 'GET') {
    const session = readSession(request)
    sendJson(response, 200, { authenticated: Boolean(session), email: session?.email ?? null })
    return
  }

  if (pathname === '/api/content' && method === 'GET') {
    sendJson(response, 200, readContent())
    return
  }

  if (['/api/login', '/api/logout', '/api/content'].includes(pathname)) {
    if (!originAllowed(request)) {
      sendJson(response, 403, { error: 'Cross-origin requests are not allowed.' })
      return
    }
    if (['POST', 'PUT'].includes(method) && !String(request.headers['content-type'] || '').startsWith('application/json')) {
      sendJson(response, 415, { error: 'Content-Type must be application/json.' })
      return
    }
  }

  if (pathname === '/api/login' && method === 'POST') {
    const ip = clientIp(request)
    if (rateLimited(ip)) {
      sendJson(response, 429, { error: 'Too many attempts. Try again in a few minutes.' })
      return
    }

    let body
    try {
      body = await readJson(request)
    } catch (error) {
      sendJson(response, 400, { error: error.message })
      return
    }

    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const emailMatches = safeEqual(email, ADMIN_EMAIL)
    const passwordMatches = verifyPassword(password)

    if (!emailMatches || !passwordMatches) {
      recordFailure(ip)
      sendJson(response, 401, { error: 'Incorrect email or password.' })
      return
    }

    clearFailures(ip)
    const session = signSession({ email: ADMIN_EMAIL, exp: Date.now() + SESSION_MAX_AGE * 1000 })
    sendJson(response, 200, { ok: true }, { 'Set-Cookie': cookieHeader(session, SESSION_MAX_AGE) })
    return
  }

  if (pathname === '/api/logout' && method === 'POST') {
    sendJson(response, 200, { ok: true }, { 'Set-Cookie': cookieHeader('', 0) })
    return
  }

  if (pathname === '/api/content' && method === 'PUT') {
    if (!readSession(request)) {
      sendJson(response, 401, { error: 'Sign in to change content.' })
      return
    }

    let body
    try {
      body = await readJson(request)
    } catch (error) {
      sendJson(response, 400, { error: error.message })
      return
    }

    if (!body || typeof body !== 'object' || Array.isArray(body) || hasUnsafeKeys(body)) {
      sendJson(response, 400, { error: 'Invalid content payload.' })
      return
    }

    writeContent(body)
    sendJson(response, 200, { ok: true })
    return
  }

  sendJson(response, 404, { error: 'Not found.' })
}

function serveStatic(request, response, pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(pathname)
  } catch {
    response.writeHead(400)
    response.end('Bad request')
    return
  }

  const requested = resolve(distDir, `.${decoded}`)
  if (requested !== distDir && !requested.startsWith(distDir + sep)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  let target = requested
  if (!existsSync(target) || !statSync(target).isFile()) {
    target = join(distDir, 'index.html')
  }

  if (!existsSync(target)) {
    response.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' })
    response.end('Run npm run build before starting the server.')
    return
  }

  const extension = extname(target).toLowerCase()
  const normalized = pathname.replace(/\/+$/, '') || '/'
  const privateRoute = normalized === '/admin' || normalized === '/login' || normalized.startsWith('/admin/') || normalized.startsWith('/login/')
  const headers = {
    'Content-Type': mimeTypes[extension] || 'application/octet-stream',
    'Cache-Control': privateRoute ? 'no-store' : extension === '.html' ? 'no-cache' : 'public, max-age=3600',
  }
  response.writeHead(200, headers)
  if (request.method === 'HEAD') {
    response.end()
    return
  }
  createReadStream(target).pipe(response)
}

const server = createServer((request, response) => {
  response.setHeader('X-Content-Type-Options', 'nosniff')
  response.setHeader('X-Frame-Options', 'DENY')
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  let pathname
  try {
    pathname = new URL(request.url || '/', `http://${request.headers.host || `localhost:${PORT}`}`).pathname
  } catch {
    response.writeHead(400)
    response.end('Bad request')
    return
  }

  if (pathname.startsWith('/api/')) {
    handleApi(request, response, pathname).catch((error) => {
      sendJson(response, 500, { error: error.message || 'Server error.' })
    })
    return
  }

  const normalized = pathname.replace(/\/+$/, '') || '/'
  const isAdminRoute = normalized === '/admin' || normalized.startsWith('/admin/')
  const isLoginRoute = normalized === '/login' || normalized.startsWith('/login/')
  const authenticated = Boolean(readSession(request))

  if (isAdminRoute && !authenticated) {
    response.writeHead(303, { Location: '/login', 'Cache-Control': 'no-store' })
    response.end()
    return
  }

  if (isLoginRoute && authenticated) {
    response.writeHead(303, { Location: '/admin', 'Cache-Control': 'no-store' })
    response.end()
    return
  }

  serveStatic(request, response, pathname)
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio server ready at http://localhost:${PORT}`)
  console.log(`Admin panel at http://localhost:${PORT}/admin`)
})
