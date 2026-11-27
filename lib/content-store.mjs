import { get, put } from '@vercel/blob'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const localFile = join(root, 'data', 'content.json')

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN || ''
}

function blobPath() {
  return process.env.CONTENT_BLOB_PATH || 'portfolio-content.json'
}

export async function readContent() {
  if (blobToken()) {
    try {
      const result = await get(blobPath(), { access: 'public', token: blobToken(), useCache: false })
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
  if (blobToken()) {
    await put(blobPath(), JSON.stringify(content, null, 2), {
      access: 'public',
      token: blobToken(),
      contentType: 'application/json; charset=utf-8',
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    })
    return
  }

  mkdirSync(dirname(localFile), { recursive: true })
  const temporary = `${localFile}.tmp`
  writeFileSync(temporary, `${JSON.stringify(content, null, 2)}\n`, 'utf8')
  renameSync(temporary, localFile)
}
