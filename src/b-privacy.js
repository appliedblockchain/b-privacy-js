const c = console
// Hacky but fixes the Error: More than one instance of bitcore-lib found.
delete global._bitcore
// const bitcore = require('bitcore-lib')
// const bitcore = require('bitcore-lib')
// const HDPrivateKey = bitcore.HDPrivateKey
// const PrivateKey = bitcore.PrivateKey
// const Random = require('bitcore-lib/lib/crypto/random')
const Mnemonic = require('bitcore-mnemonic')
const EthereumBip44 = require('ethereum-bip44/es5')
const util = require('ethereumjs-util')
const { toHex0x } = require('./core');
const { encrypt, decrypt } = require('./asymmetric-encryption');
const symmetric = require('./symmetric-encryption');
// const debug = require('debug')('b-privacy');

class BPrivacy {

  constructor({mnemonic = null, isBrowser = true}) {
    // logging - change to `this.log = true/false` to enable/suppress logs
    this.log = false
    // defines whether we're running in the browser or on a mobile environment (React-Native)
    this.isBrowser = isBrowser
    // all instance variables/attributes (for reference)
    this.hdKey = null
    this.mnemonicKey = null
    this.keyIdx = null
    this.pvtKey = null
    this.pubKey = null
    this.address = null

    if (mnemonic != null) {
      this.deriveMnemonic(mnemonic)
      this.deriveKey();
    } else {
      throw Error("Mnemonic phrase was not provided.");
    }
  }

  static generateMnemonicPhrase() {
    return new Mnemonic().phrase;
  }

  static publicKeyToAddress(publicKey) {
    return toHex0x(util.pubToAddress(toHex0x(publicKey), true));
  }

  deriveMnemonic(mnemonic) {
    const wordlist = Mnemonic.Words.ENGLISH;
    const mnemonicKey = new Mnemonic(mnemonic, wordlist);
    this.mnemonicKey = mnemonicKey;
    const hdKey = mnemonicKey.toHDPrivateKey();
    this.hdKey = hdKey;
    return mnemonicKey;
  }

  // derive first private key
  deriveKey() {
    const account = 0  // we leave the account bit not used (always set to 0) at the moment - we don't plan to use multiple accounts for now as we just increase the address index for now
    const index = 0  // starts at zero - we will increment the address index for every key the user needs
    const coinType = 60 // 60 - ethereum - *note4
    const change = 0 // 0 - false - private address
    const pathLevel = `44'/${coinType}'/${account}'/${change}` // *note2
    const derivedChild = this.hdKey.derive(`m/${pathLevel}/${index}`);
    const pvtKey = derivedChild.privateKey
    this.pvtKeyBtc = pvtKey;
    this.pvtKey = pvtKey.bn.toBuffer({ size: 32 });
    this.pubKey = this.deriveEthereumPublicKey();
    this.keyIdx = index;
    this.address = this.deriveEthereumAddress();
  }

  deriveEthereumPublicKey() {
    return util.privateToPublic(this.pvtKey);
  }

  deriveEthereumAddress() {
    const eBip44 = EthereumBip44.fromPrivateSeed(this.hdKey.toString())
    const address = eBip44.getAddress(this.keyIdx)
    return address;
  }

  // returns a promise with one parameter, the message signature
  sign(message) {
    const msgHash = util.sha3(message)

    const signature = util.ecsign(msgHash, this.pvtKey)
    return signature
  }

  web3Sign(message) {
    const signature = this.sign(message)
    const r = signature.r.toString('hex')
    const s = signature.s.toString('hex')
    const v = Buffer.from([signature.v]).toString('hex')
    return `0x${r}${s}${v}`
  }

  sha3(string) {
    return util.sha3(string).toString("hex")
  }

  _p(message) {
    if (this.log) c.log(message.toString())
  }

  static encrypt(input, privateKey, remoteKey) {
    return encrypt(input, privateKey, remoteKey);
  }

  static decrypt(input, privateKey) {
    return decrypt(input, privateKey);
  }

  // Encrypts `input` using `BPrivacy`'s private key and provided reader's
  // remote `publicKey`.
  encrypt(input, remoteKey) {
    return BPrivacy.encrypt(input, this.pvtKey, remoteKey);
  }

  // Decrypts `input` message using `BPrivacy`'s private key.
  decrypt(input) {
    return BPrivacy.decrypt(input, this.pvtKey);
  }

  // Symmetric encryption.
  //
  // @param value {any} Any json-serializable input.
  // @param secret {Buffer(32)} Secret key, usually `crypto.randomBytes(32)`.
  // @return blob {Buffer(16 + n)} Returns iv (16 bytes) + encrypted data blob.
  encryptSymmetric(value, secret) {
    return symmetric.encrypt(value, secret);
  }

  // Symmetric decryption.
  //
  // @param blob {Buffer(16 + n)} iv (16 bytes) + encrypted data input blob.
  // @param secret {Buffer(32)} Secret key, usually `crypto.randomBytes(32)`.
  // @return value {any} Decrypted value.
  decryptSymmetric(blob, secret) {
    return symmetric.decrypt(blob, secret);
  }

}

module.exports = BPrivacy

// Export module as global when loaded in browser environment.
// TODO: Is this the right way to do it? [MR]
if (process.browser) window.BPrivacy = BPrivacy // eslint-disable-line no-undef
