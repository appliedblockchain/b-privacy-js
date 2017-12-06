
const assert = require('assert')
const isString = require('./is-string')
const utf8ToBuffer = require('./utf8-to-buffer')
const bufferToKeccak256 = require('./buffer-to-keccak256')

/**
 * Calculates keccak256 for utf8 string `value`.
 *
 * @param {string} value
 * @return {buffer32}
 */
function utf8ToKeccak256(value) {
  assert(isString(value))
  return bufferToKeccak256(utf8ToBuffer(value))
}

module.exports = utf8ToKeccak256
