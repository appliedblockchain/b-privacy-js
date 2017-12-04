
const _ = require('lodash')
const BN = require('bn.js')

/**
 * Converts known value types into buffer representation.
 *
 * Numbers are converted to 32 bytes long buffers.
 *
 * @param {any} value [description]
 * @return {buffer}
 */
function toBuffer(value) {
  switch (true) {
    case _.isNumber(value):
      return new BN(value).toArrayLike(Buffer, 'be', 32)
    case _.isString(value) && value.startsWith('0x'):
      return Buffer.from(value.slice(2), 'hex')
    case _.isBuffer(value):
      return value
    case _.isString(value):
      return Buffer.from(value, 'utf8')
    case _.isBoolean(value):
      return value ? toBuffer(1) : toBuffer(0)
    default:
      throw new TypeError(`Don't know how to convert argument to buffer for ${typeof value}.`)
  }
}

module.exports = toBuffer
