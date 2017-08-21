'use strict';

const c = console;
const bitcore       = require('bitcore-lib');
const HDPrivateKey  = bitcore.HDPrivateKey;
const Random        = require('bitcore-lib/lib/crypto/random');
const Mnemonic      = require('bitcore-mnemonic');
// const EthereumBip44 = require('ethereum-bip44/src')

class BPrivacy {

  constructor({store = localStorage, isBrowser = true}) {
    this.log = true;
    // this.log = false
    this.isBrowser  = isBrowser; // whether we're running in the browser or on a mobile environment (React-Native)
    this.store        = store;
    // all instance variables/attributes (for reference)
    this.hdKeySeed    = null;
    this.hdKey        = null;
    this.mnemonicKey  = null;
    this.pvtKey       = null;
    this.pubKey       = null;
    this.addressBtc   = null;
    this.address      = null;
    this.keyIndex     = null;

    this.setupHDKey();
  }

  setupHDKey() {
    const hdKeySeed = this.store.ab_hd_private_key_seed;
    if (!hdKeySeed || hdKeySeed == "") {
      this.generateHDKey();
    } else {
      this.loadHdKey();
    }
  }

  generateHDKey() {
    this.p("Gen key");
    const hdKeySeed = Random.getRandomBuffer(16); // 16 bytes (128 bits) seed for a 12 words seed - note: a value higher than that doesn't provides additional security because 256 bit keys of bitcoin are only 128 bits strong
    const hdKey = HDPrivateKey.fromSeed(hdKeySeed);
    this.store.ab_hd_private_key_seed = hdKeySeed.toString("hex");
    this.hdKeySeed  = hdKeySeed;
    this.hdKey      = hdKey;
  }

  loadHdKey() {
    this.p("Load key");
    const hdKeySeed = new Buffer(this.store.ab_hd_private_key_seed, "hex");
    const hdKey     = HDPrivateKey.fromSeed(hdKeySeed);
    this.hdKeySeed  = hdKeySeed;
    this.hdKey      = hdKey;
  }

  deriveMnemonic() {
    const wordlist    = Mnemonic.Words.ENGLISH;
    const mnemonicKey = Mnemonic.fromSeed(this.hdKeySeed, wordlist);
    c.log(mnemonicKey);
    this.mnemonicKey = mnemonicKey;
    return mnemonicKey;
  }

  // derive first private key
  deriveKey() {
    const account  = 0;    // we leave the account bit not used (always set to 0) at the moment
    const index    = 0;    // we need to increment the account index for every key the user needs
    const coinType = 7160; // TODO: this needs to be changed so that this library is configured with a different coin type for every app we build (example 7160 for cygnetise, 7161 for cygnetise-staging, 7162 for sita, etc...)
    // simplified path-level for private blockchain application
    // 7160
    const pathLevel = `44'/${coinType}'/${account}'`;
    // infos on path levels: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels - note we skip the change address bit as we don't usually deal with native chain tokens (test-eths) as we run PoA as consensus algo
    // registered coin types: https://github.com/satoshilabs/slips/blob/master/slip-0044.md#registered-coin-types
    const derived = this.hdKey.derive(`m/${pathLevel}/${index}`);
    const pvtKey  = derived.privateKey;
    this.pvtKey   = pvtKey;
    this.pubKey   = bitcore.privatepvtKey.toPublic();
    this.addressBtc = pvtKey.toAddress();
    this.keyIndex = index;
    deriveEthereumAddress({hdPubKey: derived.hdPublicKey});
    return pvtKey
  }

  deriveEthereumAddress({hdPubKey}) {
    // const wallet = EthereumBip44.fromPublicSeed(hdPubKey.toString())
    const address = wallet.getAddress(this.keyIndex);
    this.address = address;
    return
  }

  sign() {
    // TODO: https://github.com/KenanSulayman/eccrypto
  }

  // private

  p(message) {
    if (this.log) c.log(message.toString());
  }

}


module.exports = BPrivacy;
