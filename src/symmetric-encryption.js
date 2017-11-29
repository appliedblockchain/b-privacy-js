const crypto = require('crypto')

// @param secret Buffer - crypto.randomBytes(32)
function encrypt(value, secret) {
  const json = JSON.stringify(value)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-cbc', secret, iv)
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

// @param secret Buffer - crypto.randomBytes(32)
function decrypt(blob, secret) {
  const iv = blob.slice(0, 16)
  const encrypted = blob.slice(16)
  const decipher = crypto.createDecipheriv('aes-256-cbc', secret, iv)
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ])
  const json = JSON.parse(decrypted.toString('utf8'))
  return json
}

module.exports = {
  encrypt,
  decrypt
}
