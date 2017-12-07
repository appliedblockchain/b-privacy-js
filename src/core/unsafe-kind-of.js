
const kindOf = require('./kind-of')

/**
 * Unsafe version of `kindOf`. For testing only. Should not be used in the code as it can leak sensitive information.
 *
 * @param {any} value
 * @return {string}
 */
function unsafeKindOf(value) {
  return `${kindOf(value)} ${JSON.stringify(value)}`
}

module.exports = unsafeKindOf
