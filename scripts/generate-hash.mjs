import { randomBytes, scryptSync } from 'node:crypto'

const password = process.argv[2]
if (!password) {
  console.error('Usage: node scripts/generate-hash.mjs "your-password"')
  process.exit(1)
}

const salt = randomBytes(16)
const hash = scryptSync(password, salt, 64)
console.log(`scrypt$${salt.toString('hex')}$${hash.toString('hex')}`)
