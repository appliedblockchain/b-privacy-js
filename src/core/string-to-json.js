
const assert = require('assert')
const kindOf = require('./kind-of')
const isString = require('./is-string')
const isHex0x = require('./is-hex0x')
const hex0xToBuffer = require('./hex0x-to-buffer')

function reviver(key, value) {
  if (isString(value) && value.startsWith('$bytes:') && isHex0x(value.slice(7))) {
    return hex0xToBuffer(value.slice(7))
  }
  return value
}

/**
 * Parses json string into javascript value.
 *
 * Custom parsing is used for:
 * - `$buffer:${bufferToHex0x(value)}` -> hex0xToBuffer(value.slice(7))
 *
 * @param {string} value
 * @return {any}
 */
function stringToJson(value) {
  assert(isString(value), `Expected string, got ${kindOf(value)}.`)
  return JSON.parse(value, reviver)
}

module.exports = stringToJson
