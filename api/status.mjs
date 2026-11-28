import { sendJson } from '../lib/api.mjs'
import { getBlobDiagnostics, probeBlob } from '../lib/content-store.mjs'

// Safe to open in a browser: reports configuration state only, never secrets.
// Add ?probe=1 to test reads and ?probe=1&write=1 to test writes too.
export default async function handler(request, response) {
  const url = new URL(request.url || '/', 'http://localhost')
  const diagnostics = getBlobDiagnostics()

  if (url.searchParams.get('probe') === '1') {
    diagnostics.probe = await probeBlob({ write: url.searchParams.get('write') === '1' })
  }

  sendJson(response, 200, diagnostics)
}
