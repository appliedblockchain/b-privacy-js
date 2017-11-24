const B = require('../src/b-privacy.js')
const { t } = require('./helpers');

describe('AsymmetricEncryption', function () {

  it('should perform simple a->b communication', function () {
    const a = new B({ mnemonic: B.generateMnemonicPhrase() })
    const b = new B({ mnemonic: B.generateMnemonicPhrase() })
    const m = { foo: "bar" };
    const a2b = a.encrypt(m, b.pubKey);
    const m2 = b.decrypt(a2b);
    t(m2, m);
  });

});
