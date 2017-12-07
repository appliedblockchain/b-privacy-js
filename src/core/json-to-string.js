
const bufferToHex0x = require('./buffer-to-hex0x')

function replacer(key, value) {
  if (value !== null && typeof value === 'object' && value.type === 'Buffer') {
    return [
      '$bytes',
      bufferToHex0x(Buffer.from(value.data))
    ].join(':')
  }
  return value
}

/**
 * Serializes json object into string.
 *
 * Custom serialization is used for:
 * - Buffer - `$buffer:${bufferToHex0x(value)}`
 *
 * @param  {[type]}  value          [description]
 * @param  {Boolean} [pretty=false] [description]
 * @return {[type]}                 [description]
 */
function jsonToString(value, pretty = false) {
  return JSON.stringify(value, replacer, pretty ? 2 : null)
}

module.exports = jsonToString
