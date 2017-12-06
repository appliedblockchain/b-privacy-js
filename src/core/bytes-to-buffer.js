
const isBuffer = require('./is-buffer')
const isHex0x = require('./is-hex0x')
const isHex = require('./is-hex')
const kindOf = require('./kind-of')

/**
 * Converts known byte representation (buffer, hex0x and hex) into buffer.
 *
 * @param {buffer | hex0x | hex} value
 * @return {buffer}
 */
function bytesToBuffer(value) {

  if (isBuffer(value)) {
    return value
  }

  if (isHex0x(value)) {
    return Buffer.from(value.slice(2), 'hex')
  }

  if (isHex(value)) {
    return Buffer.from(value, 'hex')
  }

  throw new TypeError(`Expected bytes representation (buffer, hex or hex0x), got ${kindOf(value)}.`)
}

module.exports = bytesToBuffer
