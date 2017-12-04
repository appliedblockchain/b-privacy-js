
const assert = require('assert')
const isBuffer = require('./is-buffer')

/**
 * Converts `Buffer` `value` into `hex`.
 *
 * @param {buffer} value
 * @return {hex}
 */
function bufferToHex(value) {
  assert(isBuffer(value), 'Expected buffer.')
  return value.toString('hex')
}

module.exports = bufferToHex
