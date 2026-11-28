import { del, get, put } from '@vercel/blob'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const localFile = join(root, 'data', 'content.json')
const onVercel = process.env.VERCEL === '1'

// Vercel prefixes the token with the store name when a custom prefix is used
// (for example PORTFOLIO_READ_WRITE_TOKEN), not always BLOB_READ_WRITE_TOKEN.
function readWriteToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN
  const custom = Object.entries(process.env)
    .filter(([key, value]) => {
      return Boolean(value) && key !== 'BLOB_READ_WRITE_TOKEN' && /^[A-Z0-9]+(?:_[A-Z0-9]+)*_READ_WRITE_TOKEN$/.test(key)
    })
    .sort(([a], [b]) => a.length - b.length)[0]
  return custom?.[1] ?? ''
}

function storeId() {
  return process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN_STORE_ID || ''
}

function access() {
  return process.env.BLOB_ACCESS === 'private' ? 'private' : 'public'
}

function pathname() {
  return process.env.CONTENT_BLOB_PATH || 'portfolio-content.json'
}

// Prefer OIDC on Vercel (the default for connected stores) and fall back to a
// read-write token. Passing a token explicitly would override OIDC and can
// silently target an old or different store.
function authModes() {
  const token = readWriteToken()
  const sid = storeId()
  const modes = []
  if (onVercel && sid) modes.push({ storeId: sid })
  if (token) modes.push({ token })
  if (!onVercel && sid) modes.push({ storeId: sid })
  return modes
}

export function getBlobDiagnostics() {
  const token = readWriteToken()
  const sid = storeId()
  return {
    vercel: onVercel,
    blobConfigured: Boolean(token || sid),
    credentials: token
      ? process.env.BLOB_READ_WRITE_TOKEN
        ? 'BLOB_READ_WRITE_TOKEN'
        : 'custom *_READ_WRITE_TOKEN'
      : sid
        ? 'BLOB_STORE_ID (OIDC)'
        : 'none',
    storeId: sid ? 'set' : 'not set',
    access: access(),
    path: pathname(),
    storage: onVercel ? 'vercel-blob' : `local file (${localFile})`,
  }
}

export function explainBlobError(error) {
  const message = String(error?.message || error || '')
  if (/No blob credentials|not configured/i.test(message)) {
    return 'Blob storage is not configured. Set BLOB_STORE_ID (OIDC) or BLOB_READ_WRITE_TOKEN, then redeploy.'
  }
  if (/oidc|environment/i.test(message)) {
    return 'Vercel OIDC could not authenticate. Enable OIDC for this environment or add a valid BLOB_READ_WRITE_TOKEN.'
  }
  if (/forbidden|unauthor|access|denied|403|401/i.test(message)) {
    return `Blob access denied. Check BLOB_ACCESS (currently "${access()}") matches your store's access setting.`
  }
  if (/not found|404|store/i.test(message)) {
    return 'Blob store or file was not found. Check BLOB_STORE_ID and that the token belongs to the right store.'
  }
  return message || 'Unknown Blob error.'
}

async function runWithBlob(fn) {
  const modes = authModes()
  if (!modes.length) {
    throw new Error('Blob storage is not configured. Set BLOB_STORE_ID (OIDC) or BLOB_READ_WRITE_TOKEN, then redeploy.')
  }
  let lastError
  for (const mode of modes) {
    try {
      return await fn({ access: access(), ...mode })
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

export async function readContent() {
  if (getBlobDiagnostics().blobConfigured) {
    try {
      const result = await runWithBlob((options) => get(pathname(), { ...options, useCache: false }))
      if (!result?.stream) return {}
      const chunks = []
      for await (const chunk of result.stream) chunks.push(Buffer.from(chunk))
      return JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch (error) {
      console.warn('[content-store] Could not read from Blob, using defaults:', explainBlobError(error))
      return {}
    }
  }

  if (onVercel) {
    console.error('[content-store] No Blob credentials found. Content edits cannot be saved on Vercel.')
    return {}
  }

  try {
    return JSON.parse(readFileSync(localFile, 'utf8'))
  } catch {
    return {}
  }
}

export async function writeContent(content) {
  if (getBlobDiagnostics().blobConfigured) {
    await runWithBlob((options) =>
      put(pathname(), JSON.stringify(content, null, 2), {
        ...options,
        contentType: 'application/json; charset=utf-8',
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60,
      }),
    )
    return
  }

  if (onVercel) {
    // Vercel's filesystem is read-only and changes are ephemeral. Never
    // pretend a save worked by writing to a local file here.
    throw new Error('Blob storage is not configured. Add BLOB_STORE_ID (OIDC) or BLOB_READ_WRITE_TOKEN to the Vercel project, then redeploy.')
  }

  mkdirSync(dirname(localFile), { recursive: true })
  const temporary = `${localFile}.tmp`
  writeFileSync(temporary, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
  renameSync(temporary, localFile)
}

// Diagnostic helper used by GET /api/status to find the exact cause of a
// failed save without exposing any secret values.
export async function probeBlob({ write = false } = {}) {
  const result = { read: null, write: null }

  try {
    const blob = await runWithBlob((options) => get(pathname(), { ...options, useCache: false }))
    result.read = { ok: Boolean(blob?.stream) }
  } catch (error) {
    result.read = { ok: false, error: explainBlobError(error) }
  }

  if (!write) return result

  const probePath = `${pathname()}.probe`
  try {
    await runWithBlob((options) =>
      put(probePath, 'ok', {
        ...options,
        contentType: 'text/plain',
        addRandomSuffix: false,
        allowOverwrite: true,
      }),
    )
    result.write = { ok: true }
    try {
      await runWithBlob(({ token, storeId: sid }) => del(probePath, { token, storeId: sid }))
    } catch {
      // Best-effort cleanup. A leftover probe file is harmless.
    }
  } catch (error) {
    result.write = { ok: false, error: explainBlobError(error) }
  }

  return result
}
