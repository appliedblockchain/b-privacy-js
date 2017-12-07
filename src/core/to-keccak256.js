
const toBuffer = require('./to-buffer')
const bufferToKeccak256 = require('./buffer-to-keccak256')

/**
 * Converts any value to keccak256 hash.
 *
 * @param {any} value
 * @return {buffer} 32 bytes.
 */
function toKeccak256(value) {
  return bufferToKeccak256(toBuffer(value))
}

module.exports = toKeccak256
