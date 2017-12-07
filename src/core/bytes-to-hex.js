
const isHex0x = require('./is-hex0x')
const isHex = require('./is-hex')
const isBuffer = require('./is-buffer')
const kindOf = require('./kind-of')

/**
 * Converts known byte representations (buffer, hex0x, hex) to hex.
 *
 * @param {buffer | hex0x | hex} value
 * @return {hex}
 */
function bytesToHex(value) {

  if (isHex(value)) {
    return value
  }

  if (isHex0x(value)) {
    return value.slice(2)
  }

  if (isBuffer(value)) {
    return value.toString('hex')
  }

  throw new TypeError(`Expected byte representation (buffer, hex0x or hex), got ${kindOf(value)}.`)
}

module.exports = bytesToHex
