

/**
 * Checks if `value` is safe integer.
 *
 * @param {any} value
 * @return {boolean}
 */
function isInteger(value) {
  return Number.isSafeInteger(value)
}

module.exports = isInteger
