
const callHash = require('../src/core/call-hash')
const stringToJson = require('../src/core/string-to-json')
const jsonToString = require('../src/core/json-to-string')
const isBuffer = require('../src/core/is-buffer')
const areBuffersEqual = require('../src/core/are-buffers-equal')
const { t } = require('./helpers')

describe('core', function () {

  it('does call-hash', function () {
    t(callHash('foo', true, 42, false), '0xe96d1d7b601a947cec0ae21ed4659039730dd259befea634a2b09af0ad091c86')
  })

  it('handles buffers in json serialization/parsing', () => {
    const string = jsonToString({ foo: Buffer.from([ 0xff, 0x42 ])})
    const json = stringToJson(string)
    t(isBuffer(json.foo))
    t(areBuffersEqual(json.foo, Buffer.from([ 0xff, 0x42 ])))
  })

})
