
const createKeccakHash = require('keccak')

function toChecksumAddress(address) {
  const hex = address.slice(2).toLowerCase()
  const hash = createKeccakHash('keccak256').update(hex).digest('hex')
  return '0x' + hex
    .split('')
    .map((c, i) => parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c)
    .join('')
}

module.exports = toChecksumAddress
