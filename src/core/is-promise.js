
/**
 * Checks if `value` looks like `Promise/A+`, returns `true` or `false`.
 *
 * @param {any} value
 * @return {boolean}
 */
function isPromise(value) {
  return value !== null && typeof value === 'object' && typeof value.then === 'function'
}

module.exports = isPromise
