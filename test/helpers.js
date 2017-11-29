
const assert = require('assert')

function t(a, b, c) {
  if (typeof a === 'function') {
    return assert.throws(a, b, c)
  }
  if (arguments.length === 1) {
    return assert(a)
  }
  return assert.deepEqual(a, b, c)
}

function f(a, b, c) {
  if (typeof a === 'function') {
    return assert.doesNotThrow(a, b, c)
  }
  if (arguments.length === 1) {
    return assert(!a)
  }
  return assert.notDeepEqual(a, b, c)
}

module.exports = {
  t,
  f
}
