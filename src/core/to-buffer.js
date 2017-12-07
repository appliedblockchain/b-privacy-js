
const BN = require('bn.js')
const isBuffer = require('./is-buffer')
const isBoolean = require('./is-boolean')
const isInteger = require('./is-integer')
const isHex0x = require('./is-hex0x')
const isHex = require('./is-hex')
const isString = require('./is-string')
const kindOf = require('./kind-of')

/**
 * Converts known value types into buffer representation. Please note that if `value` (ie. user input) happens
 * to conform to hex/0x-hex format - calculated hash may not be what is expected. In order to get consistent
 * hashes on ie. user inputs, please use dedicated functions, ie. `bufferToKeccak256(utf8ToBuffer(value))`.
 *
 * @param {any} value [description]
 * @return {buffer}
 */
function toBuffer(value) {

  // NOTE: No-copy.
  if (isBuffer(value)) {
    return value
  }

  // Booleans are treated as numbers.
  if (isBoolean(value)) {
    return toBuffer(value ? 1 : 0)
  }

  // Numbers are mapped to 32 byte buffers. Only integers are supported.
  // TODO: Check for safe max int.
  if (isInteger(value)) {
    return toBuffer(new BN(value).toArrayLike(Buffer, 'be', 32))
  }

  // 0x-prefixed hex strings are converted to buffers.
  if (isHex0x(value)) {
    return Buffer.from(value.slice(2), 'hex')
  }

  // Hex strings are also converted to buffers.
  if (isHex(value)) {
    return Buffer.from(value, 'hex')
  }

  // All other strings are mapped to buffers via utf8 encoding.
  if (isString(value)) {
    return Buffer.from(value, 'utf8')
  }

  throw new TypeError(`Don't know how to convert ${kindOf(value)} to buffer.`)
}

module.exports = toBuffer
