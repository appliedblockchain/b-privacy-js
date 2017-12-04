
const assert = require('assert')
const isString = require('./is-string')

/**
 * Converts utf8 string into a buffer.
 *
 * @param {string} value
 * @return {buffer}
 */
function utf8ToBuffer(value) {
  assert(isString(value))
  return Buffer.from(value, 'utf8')
}

module.exports = utf8ToBuffer
