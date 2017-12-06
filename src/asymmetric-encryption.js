
const assert = require('assert')
const elliptic = require('elliptic')
const crypto = require('crypto')
const bytesToBuffer = require('./core/bytes-to-buffer')

const debug = require('debug')('b-privacy:asmmetric-encryption')

const ec = elliptic.ec('secp256k1')

// TODO: Remove, use `crypto.pbkdf2` or something else.
function kdf(keyMaterial, keyLength) {
  const blockSize = 64
  const reps = ((keyLength + 7) * 8) / (blockSize * 8)
  const buffers = []
  for (let counter = 0, tmp = Buffer.allocUnsafe(4); counter <= reps;) {
    counter += 1
    tmp.writeUInt32BE(counter)
    buffers.push(crypto.createHash('sha256').update(tmp).update(keyMaterial).digest())
  }
  return Buffer.concat(buffers).slice(0, keyLength)
}

// Encrypts `input` JSON message using `privateKey` and `remoteKey` public key.
function encrypt(input, _privateKey, _remoteKey) {

  // Serialize input.
  const data = Buffer.from(JSON.stringify(input), 'utf8')

  // We'll work on buffer for private key.
  const privateKey = bytesToBuffer(_privateKey)

  // We'll work on buffer for remote public key.
  const remoteKey = bytesToBuffer(_remoteKey)

  // Make sure we've got x and y in public key.
  // TODO: Double check if this is correct, I believe you can derive y from x. [mr]
  assert(remoteKey.length === 2 * 32, `Invalid remote public key length ${remoteKey.length}, expected (2 * 32) bytes.`)

  const x = remoteKey.slice(0, 32)
  const y = remoteKey.slice(32, 64)

  // Derive secret.
  const secret = ec.keyFromPrivate(privateKey)
    .derive(ec.keyFromPublic({ x, y }).getPublic())
    .toArrayLike(Buffer, 'be', 32)

  const key = kdf(secret, 32)
  const ekey = key.slice(0, 16)
  const mkey = crypto.createHash('sha256')
    .update(key.slice(16, 32))
    .digest()

  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-128-ctr', ekey, iv)
  const encryptedData = Buffer.concat([
    cipher.update(data),
    cipher.final()
  ])
  const ivData = Buffer.concat([ iv, encryptedData ])

  const tag = crypto.createHmac('sha256', mkey)
    .update(ivData)
    .digest()

  debug('encrypt', { tag })

  const output = Buffer.concat([
    Buffer.from(ec.keyFromPrivate(privateKey).getPublic('hex'), 'hex'),
    ivData,
    tag
  ])

  // const result = toHex0x(output)

  return output
}

function decrypt(input, privateKey) {

  // Let's work on buffer.
  const data = bytesToBuffer(input)

  const publicKey = data.slice(0, 65)

  const ivData = data.slice(65, -32)
  const tag = data.slice(-32)

  // Derive secret.
  const secret = ec.keyFromPrivate(privateKey)
    .derive(ec.keyFromPublic(publicKey).getPublic())
    .toArrayLike(Buffer, 'be', 32)

  const key = kdf(secret, 32)
  const ekey = key.slice(0, 16)
  const mkey = crypto.createHash('sha256').update(key.slice(16, 32)).digest()

  const tag2 = crypto.createHmac('sha256', mkey).update(ivData).digest()
  debug('decrypt', { tag, tag2 })
  assert(tag2.equals(tag), 'Tag mismatch.')

  const iv = ivData.slice(0, 16)
  const encryptedData = ivData.slice(16)
  const decipher = crypto.createDecipheriv('aes-128-ctr', ekey, iv)
  const decrypted = Buffer.concat([
    decipher.update(encryptedData),
    decipher.final()
  ])
  return JSON.parse(decrypted.toString('utf8'))
}

module.exports = {
  encrypt,
  decrypt
}
