
const assert = require('assert')
const isBuffer = require('./is-buffer')

/**
 * Checks if buffers are byte-to-byte equal.
 *
 * @param {buffer} value
 * @param {buffer} otherValue
 * @return {boolean}
 */
function areBuffersEqual(value, otherValue) {
  assert(isBuffer(value))
  assert(isBuffer(otherValue))
  return value.equals(otherValue)
}

module.exports = areBuffersEqual
