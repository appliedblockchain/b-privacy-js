const assert = require('assert');
const { encrypt, decrypt } = require('../src/asymmetric-encryption.js')
const BPrivacy = require('../src/b-privacy.js')

function t(a, b, c) {
  assert.deepEqual(a, b, c);
}

describe('AsymmetricEncryption', function () {

  it('should perform simple a->b communication', function () {
    const a = new BPrivacy({ mnemonic: BPrivacy.generateMnemonicPhrase() })
    const b = new BPrivacy({ mnemonic: BPrivacy.generateMnemonicPhrase() })
    const m = { foo: "bar" };
    const a2b = encrypt(m, {
      publicKey: b.publicKey,
      privateKey: a.privateKey
    });
    const m2 = decrypt(a2b, {
      privateKey: b.privateKey,
      publicKey: a.publicKey
    });
    t(m2, m);
  });

});
