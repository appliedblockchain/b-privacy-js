
const isHex0x = require('./is-hex0x')
const isHex = require('./is-hex')
const isBuffer = require('./is-buffer')
const kindOf = require('./kind-of')

/**
 * Converts known byte representations (buffer, hex0x) to hex.
 *
 * @param {buffer | hex | hex0x} value
 * @return {hex}
 */
function toHex(value) {
  // assertRepresentsBytes(value)

  if (isHex(value)) {
    return value
  }

  if (isHex0x(value)) {
    return value.slice(2)
  }

  if (isBuffer(value)) {
    return value.toString('hex')
  }

  throw new TypeError(`Don't know how to convert ${kindOf(value)} to hex.`)
}

module.exports = toHex
