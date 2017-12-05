
const callHash = require('../src/core/call-hash')
// const bufferToHex = require('../src/core/buffer-to-hex')
const { t } = require('./helpers')

describe('core', function () {

  it('does call-hash', function () {
    t(callHash('foo', true, 42, false), '0xe96d1d7b601a947cec0ae21ed4659039730dd259befea634a2b09af0ad091c86')
  })

})
