const assert = require('assert');
const { isHex } = require('../src/core');

describe('Symmetric encryption', function () {
  it('should recognise hex string', function () {
    assert(isHex('0303f0125c59df0c93b5a20c90fd7924308f6ef5b61bc5704cdade2c53c6941952'));
  });
});
