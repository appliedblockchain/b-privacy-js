
const isPromise = require('./is-promise')

/**
 * Returns string describing type of `value`, ie. `null` or `promise`.
 *
 * @param {any} value
 * @return {string}
 */
function kindOf(value) {
  if (typeof value !== 'object') {
    return typeof value
  }
  if (value === null) {
    return 'null'
  }
  if (Array.isArray(value)) {
    return 'array'
  }
  if (isPromise(value)) {
    return 'promise'
  }
  if (Buffer.isBuffer(value)) {
    return 'buffer'
  }
  return '[other]'
}

module.exports = kindOf
