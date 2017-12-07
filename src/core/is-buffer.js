
/**
 * Checks if `value` is a `Buffer`, returns `true` if it is or `false` otherwise.
 *
 * @param {any} value
 * @return {boolean}
 */
function isBuffer(value) {
  return Buffer.isBuffer(value)
}

module.exports = isBuffer
