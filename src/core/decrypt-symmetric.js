
const crypto = require('crypto')
const bytesToBuffer = require('./bytes-to-buffer')
const stringToJson = require('./string-to-json')

/**
 * Decrypts `blob_` using `secret_` and symmetric `.algo` (default aes-256-cbc).
 *
 * @param {} blob_ 16-bytes iv + encrypted data.
 * @param {bytes} secret_ 32 bytes secret.
 * @param {string} .algo = 'aes-256-cbc'
 * @return {any} Decrypted value.
 */
function decryptSymmetric(blob_, secret_, { algo = 'aes-256-cbc' } = {}) {
  const secret = bytesToBuffer(secret_)
  if (secret.length !== 32) {
    throw new TypeError(`Expected 32 bytes long secret, got ${secret.length}.`)
  }
  const blob = bytesToBuffer(blob_)
  if (blob.length <= 16) {
    throw new TypeError(`Expected blob with length greater than 16, got ${blob.length}.`)
  }
  const iv = blob.slice(0, 16)
  const encrypted = blob.slice(16)
  const decipher = crypto.createDecipheriv(algo, secret, iv)
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
  const json = stringToJson(decrypted.toString('utf8'))
  return json
}

module.exports = decryptSymmetric
