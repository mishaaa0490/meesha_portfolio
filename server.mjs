import { existsSync, createReadStream, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { dirname, extname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import contentHandler from './api/content.mjs'
import loginHandler from './api/login.mjs'
import logoutHandler from './api/logout.mjs'
import sessionHandler from './api/session.mjs'
import statusHandler from './api/status.mjs'
import { getAuthConfig } from './lib/config.mjs'
import { readSessionFromCookie } from './lib/session.mjs'

const root = dirname(fileURLToPath(import.meta.url))
const distDir = join(root, 'dist')
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
const authConfig = getAuthConfig()

if (!authConfig.email || !authConfig.hash || authConfig.secret.length < 32) {
  console.error('Missing server auth config. Set ADMIN_EMAIL, ADMIN_PASSWORD_HASH and SESSION_SECRET (32+ chars) in .env.server')
  process.exit(1)
}

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

const apiHandlers = {
  '/api/session': sessionHandler,
  '/api/login': loginHandler,
  '/api/logout': logoutHandler,
  '/api/content': contentHandler,
  '/api/status': statusHandler,
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

async function handleRequest(request, response) {
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

  const handler = apiHandlers[pathname]
  if (handler) {
    await handler(request, response)
    return
  }

  const normalized = pathname.replace(/\/+$/, '') || '/'
  const isAdminRoute = normalized === '/admin' || normalized.startsWith('/admin/')
  const isLoginRoute = normalized === '/login' || normalized.startsWith('/login/')
  const session = await readSessionFromCookie(request.headers.cookie)

  if (isAdminRoute && !session) {
    response.writeHead(303, { Location: '/login', 'Cache-Control': 'no-store' })
    response.end()
    return
  }

  if (isLoginRoute && session) {
    response.writeHead(303, { Location: '/admin', 'Cache-Control': 'no-store' })
    response.end()
    return
  }

  serveStatic(request, response, pathname)
}

const server = createServer((request, response) => {
  handleRequest(request, response).catch((error) => {
    if (response.headersSent) {
      response.end()
      return
    }
    response.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
    response.end(JSON.stringify({ error: error.message || 'Server error.' }))
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Portfolio server ready at http://localhost:${PORT}`)
  console.log(`Admin panel at http://localhost:${PORT}/admin`)
})
