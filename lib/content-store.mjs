import { get, put } from '@vercel/blob'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const localFile = join(root, 'data', 'content.json')

function blobOptions() {
  const options = {}
  const token = process.env.BLOB_READ_WRITE_TOKEN
  const storeId = process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN_STORE_ID
  if (token) options.token = token
  if (storeId) options.storeId = storeId
  return options
}

function blobConfigured() {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN ||
      process.env.BLOB_STORE_ID ||
      process.env.BLOB_READ_WRITE_TOKEN_STORE_ID,
  )
}

function blobAccess() {
  return process.env.BLOB_ACCESS === 'private' ? 'private' : 'public'
}

function blobPath() {
  return process.env.CONTENT_BLOB_PATH || 'portfolio-content.json'
}

export async function readContent() {
  if (blobConfigured()) {
    try {
      const result = await get(blobPath(), { access: blobAccess(), useCache: false, ...blobOptions() })
      if (!result?.stream) return {}
      const chunks = []
      for await (const chunk of result.stream) chunks.push(Buffer.from(chunk))
      return JSON.parse(Buffer.concat(chunks).toString('utf8'))
    } catch {
      return {}
    }
  }

  try {
    return JSON.parse(readFileSync(localFile, 'utf8'))
  } catch {
    return {}
  }
}

export async function writeContent(content) {
  if (blobConfigured()) {
    await put(blobPath(), JSON.stringify(content, null, 2), {
      access: blobAccess(),
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
      ...blobOptions(),
    })
    return
  }

  mkdirSync(dirname(localFile), { recursive: true })
  const temporary = `${localFile}.tmp`
  writeFileSync(temporary, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
  renameSync(temporary, localFile)
}
