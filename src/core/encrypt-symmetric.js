
const crypto = require('crypto')
const randomBytes = require('./random-bytes')
const bytesToBuffer = require('./bytes-to-buffer')
const jsonToString = require('./json-to-string')

/**
 * Encrypts `value` using symmetric encryption `.algo` with provided `secret`.
 *
 * @param {any} value Any JSON serializable value.
 * @param {bytes} secret_ 32 bytes secret, ie. `randomBytes(32)`.
 * @return {buffer} 16-bytes iv followed by encrypted blob.
 */
function encryptSymmetric(value, secret_, { algo = 'aes-256-cbc' } = {}) {
  const secret = bytesToBuffer(secret_)
  if (secret.length !== 32) {
    throw new TypeError(`Expected 32 bytes long secret, got ${secret.length}.`)
  }
  const json = jsonToString(value)
  const iv = randomBytes(16)
  const cipher = crypto.createCipheriv(algo, secret, iv)
  const encrypted = Buffer.concat([
    cipher.update(json),
    cipher.final()
  ])
  const blob = Buffer.concat([
    iv,
    encrypted
  ])
  return blob
}

module.exports = encryptSymmetric
