
const assert = require('assert')
const keccak = require('keccak')

/**
 * Calcualtes keccak256 on provided buffer.
 *
 * @param {buffer} value
 * @return {buffer} 32 bytes
 */
function bufferToKeccak256(value) {
  assert(Buffer.isBuffer(value), `Expected Buffer, got ${typeof buf}.`)
  return keccak('keccak256').update(value).digest()
}

module.exports = bufferToKeccak256
