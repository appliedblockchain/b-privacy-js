
const isHex0x = require('./is-hex0x')
const isHex = require('./is-hex')
const isBuffer = require('./is-buffer')
const kindOf = require('./kind-of')

/**
 * Converts known byte representations (buffer, hex0x or hex) to hex0x.
 *
 * @param {buffer | hex0x | hex} value
 * @return {hex0x}
 */
function bytesToHex0x(value) {

  if (isHex0x(value)) {
    return value
  }

  if (isHex(value)) {
    return '0x' + value
  }

  if (isBuffer(value)) {
    return '0x' + value.toString('hex')
  }

  throw new TypeError(`Expected byte representation (buffer, hex0x or hex), got ${kindOf(value)}.`)
}

module.exports = bytesToHex0x
