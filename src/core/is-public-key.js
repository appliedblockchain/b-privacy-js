
const isBuffer = require('./is-buffer')
const isHex = require('./is-hex')
const isHex0x = require('./is-hex0x')

/**
 * Checks if `value` represents public key.
 *
 * @param {buffer | hex | hex0x} value
 * @return {boolean}
 */
function isPublicKey(value) {
  if (isBuffer(value)) {
    return value.length === 64
  }

  if (isHex(value)) {
    return value.length === 64 * 2
  }

  if (isHex0x(value)) {
    return value.length === 2 + 64 * 2
  }

  return false
}

module.exports = isPublicKey
