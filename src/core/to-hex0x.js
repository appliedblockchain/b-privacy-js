
const isHex0x = require('./is-hex0x')
const isHex = require('./is-hex')
const isBuffer = require('./is-buffer')
const kindOf = require('./kind-of')

/**
 * Converts known byte representations (buffer, hex) to hex0x.
 *
 * @param {buffer | hex | hex0x} value
 * @return {hex0x}
 */
function toHex0x(value) {
  // assertRepresentsBytes(value)

  if (isHex0x(value)) {
    return value
  }

  if (isHex(value)) {
    return '0x' + value
  }

  if (isBuffer(value)) {
    return '0x' + value.toString('hex')
  }

  throw new TypeError(`Don't know how to convert ${kindOf(value)} to hex0x.`)
}

module.exports = toHex0x
