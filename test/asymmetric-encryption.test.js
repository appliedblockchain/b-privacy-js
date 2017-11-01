const AsymmetricEncryption = require('../src/asymmetric-encryption.js')
const BPrivacy = require('../src/b-privacy.js')

const assert = require('assert');
const abCrypto = require('../src');

function t(a, b, c) {
  assert.deepEqual(a, b, c);
}

describe('AsymmetricEncryption', function () {

  it('should perform simple a->b communication', async function () {
  	const bpA = new BPrivacy({mnemonic: BPrivacy.generateMnemonicPhrase()})
  	const bpB = new BPrivacy({mnemonic: BPrivacy.generateMnemonicPhrase()})
    const m1 = { foo: "bar" };
    const a2b = await abCrypto.encrypt(m1, b.publicKey, a.privateKey);
    const m2 = await abCrypto.decrypt(a2b, b.privateKey, a.publicKey);
    t(m2, m1);
  });

});
