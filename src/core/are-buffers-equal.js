
const assert = require('assert')
const isBuffer = require('./is-buffer')
const kindOf = require('./kind-of')

/**
 * Checks if buffers are byte-to-byte equal.
 *
 * @param {buffer} value
 * @param {buffer} otherValue
 * @return {boolean}
 */
function areBuffersEqual(value, otherValue) {
  assert(isBuffer(value), `Invalid value type ${kindOf(value)}, expected buffer.`)
  assert(isBuffer(otherValue), `Invalid other value type ${kindOf(otherValue)}, expected buffer.`)
  return value.equals(otherValue)
}

module.exports = areBuffersEqual
