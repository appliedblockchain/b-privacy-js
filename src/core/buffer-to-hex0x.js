
const assert = require('assert')
const isBuffer = require('./is-buffer')

/**
 * Converts `Buffer` `value` into `hex0x`.
 *
 * @param {buffer} value
 * @return {hex0x}
 */
function bufferToHex0x(value) {
  assert(isBuffer(value), 'Expected buffer.')
  return '0x' + value.toString('hex')
}

module.exports = bufferToHex0x
