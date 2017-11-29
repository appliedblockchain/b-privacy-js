const { encrypt, decrypt } = require('../src/symmetric-encryption')
const crypto = require('crypto')
const { t } = require('./helpers')

describe('Symmetric encryption', function () {

  it('should work', function () {
    const secret = crypto.randomBytes(32)
    const encrypted = encrypt({ foo: 'bar' }, secret)
    const decrypted = decrypt(encrypted, secret)
    t(decrypted, { foo: 'bar' })
  })

})
