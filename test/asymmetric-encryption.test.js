const assert = require('assert');
const B = require('../src/b-privacy.js')

function t(a, b, c) {
  assert.deepEqual(a, b, c);
}

describe('AsymmetricEncryption', function () {

  it('should perform simple a->b communication', function () {
    const a = new B({ mnemonic: B.generateMnemonicPhrase() })
    const b = new B({ mnemonic: B.generateMnemonicPhrase() })
    const m = { foo: "bar" };
    const a2b = a.encrypt(m, b.publicKey);
    const m2 = b.decrypt(a2b);
    t(m2, m);
  });

});
