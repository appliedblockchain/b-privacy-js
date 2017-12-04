const assert = require('assert')
const keccak = require('keccak')
const isHex0x = require('./is-hex0x')

/**
 * Converts an address into checksummed version.
 *
 * @param {hex0x} address
 * @return {hex0x}
 */
function toChecksumAddress(address) {
  assert(isHex0x(address), 'Expected hex0x.')
  assert(address.length === 2 + 20 * 2, 'Invalid address length.')
  const hex = address.slice(2).toLowerCase()
  const hash = keccak('keccak256').update(hex).digest('hex')
  return '0x' + hex
    .split('')
    .map((c, i) => parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c)
    .join('')
}

module.exports = toChecksumAddress
