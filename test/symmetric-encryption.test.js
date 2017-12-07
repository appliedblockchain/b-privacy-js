const encryptSymmetric = require('../src/core/encrypt-symmetric')
const decryptSymmetric = require('../src/core/decrypt-symmetric')
const randomBytes = require('../src/core/random-bytes')
const bytesToBuffer = require('../src/core/bytes-to-buffer')
const bytesToHex0x = require('../src/core/bytes-to-hex0x')
const bytesToHex = require('../src/core/bytes-to-hex')
const { t } = require('./helpers')

function convertTo(value, name) {
  switch (name) {
    case 'buffer': return bytesToBuffer(value)
    case 'hex0x': return bytesToHex0x(value)
    case 'hex': return bytesToHex(value)
    default:
      throw new TypeError(`Unknown convertion name ${name}.`)
  }
}

describe('Symmetric encryption', function () {

  ['buffer', 'hex0x', 'hex'].forEach(name => {
    it(`should work for secret as ${name}`, () => {
      const secret = convertTo(randomBytes(32), name)
      const encrypted = encryptSymmetric({ foo: 'bar' }, secret)
      const decrypted = decryptSymmetric(encrypted, secret)
      t(decrypted, { foo: 'bar' })
    })
  })

})
