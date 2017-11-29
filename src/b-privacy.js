const c = console
// Hacky but fixes the Error: More than one instance of bitcore-lib found.
delete global._bitcore
// const bitcore = require('bitcore-lib')
// const bitcore = require('bitcore-lib')
// const HDPrivateKey = bitcore.HDPrivateKey
// const PrivateKey = bitcore.PrivateKey
// const Random = require('bitcore-lib/lib/crypto/random')
const Mnemonic = require('bitcore-mnemonic')
const EthereumBip44 = require('./ethereum-bip44')
const util = require('ethereumjs-util')
const { encrypt, decrypt } = require('./asymmetric-encryption');
const symmetric = require('./symmetric-encryption');
const secp256k1 = require('secp256k1');
const {
  isBytes,
  isBuffer,
  bufferToKeccak256,
  isString,
  toChecksumAddress,
  toHex0x,
  toHex,
  toBuffer,
  kindOf
} = require('./core');
const assert = require('assert');

// const debug = require('debug')('b-privacy');

class BPrivacy {

  constructor({ mnemonic = null, isBrowser = true }) {
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

  static keccak256(value) {
    if (isBuffer(value)) {
      return bufferToKeccak256(value);
    }
    if (isString(value)) {
      return bufferToKeccak256(Buffer.from(value, 'utf8'));
    }
    throw new TypeError(`Invalid input type ${typeof value}.`);
  }

  static toChecksumAddress(address) {
    return toChecksumAddress(address);
  }

  static publicKeyToAddress(publicKey) {
    return toChecksumAddress(toHex0x(util.pubToAddress(toHex0x(publicKey), true)));
  }

  static areAddressesEqual(a, b) {
    return toChecksumAddress(a) === toChecksumAddress(b);
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

  // @returns {buffer} Public key, uncompressed format.
  get publicKey() {
    return this.pubKey;
  }

  getPublicKey(encoding) {
    switch (encoding) {
      case 'buffer':
        return this.publicKey;
      case 'hex0x':
        return toHex0x(this.publicKey);
      case 'hex':
        return toHex(this.publicKey);
      default:
        throw new TypeError(`Unknown encoding ${encoding}, expected "buffer", "hex0x" or "hex".`);
    }
  }

  deriveEthereumPublicKey() {
    return util.privateToPublic(this.pvtKey);
  }

  deriveEthereumAddress() {
    const eBip44 = EthereumBip44.fromPrivateSeed(this.hdKey.toString())
    const address = eBip44.getAddress(this.keyIdx)
    return toChecksumAddress(address);
  }

  // TODO: Remove, use ecsign(...).
  sign(message) {
    const msgHash = util.sha3(message);
    const signature = util.ecsign(msgHash, this.pvtKey);
    return signature;
  }

  // TODO: Remove, use ecsign(...).
  web3Sign(message) {
    const sig = this.sign(message);
    const r = sig.r.toString('hex');
    const s = sig.s.toString('hex');
    const v = Buffer.from([sig.v]).toString('hex');
    return `0x${r}${s}${v}`;
  }

  // Signs message hash.
  // @param hash {hex0x} keccak256 of the message.
  // @returns {hex0x} ecsig (r + s + v blob).
  ecsign(hash) {
    const hashBuf = toBuffer(hash);
    const { signature, recovery } = secp256k1.sign(hashBuf, this.pvtKey);
    const r = signature.slice(0, 32).toString('hex');
    const s = signature.slice(32, 64).toString('hex');
    const v = Buffer.from([ recovery + 27 ]).toString('hex');
    return '0x' + r + s + v;
  }

  // @param hash {hex0x} keccak256 of the message.
  // @param sig {hex0x} Signature blob (message hash + r + s + v; 32 + 32 + 32 + 1 bytes).
  // @returns {hex0x} Public key.
  static ecrecover(hash, ecsig) {

    // Get hash buffer.
    const hashBuf = toBuffer(hash);
    if (hashBuf.length !== 32) {
      throw new TypeError(`Invalid message hash buffer length ${hashBuf.length}, expected 32.`);
    }

    // Parse ecsig hex0x into buffer.
    const ecsigBuf = Buffer.from(ecsig.slice(2), 'hex');
    if (ecsigBuf.length !== 32 + 32 + 1) {
      throw new TypeError(`Invalid signature buffer length ${ecsigBuf.length}, expected (32 + 32 + 1).`);
    }

    // Extract signature (r + s) and recovery (v).
    const signature = ecsigBuf.slice(0, 64);
    const recovery = ecsigBuf[64] - 27;
    if (recovery !== 0 && recovery !== 1) {
      throw new Error('Invalid recovery value, expected 0 or 1.');
    }

    // Recover public key.
    const publicKey = secp256k1.recover(hashBuf, signature, recovery);
    return '0x' + secp256k1.publicKeyConvert(publicKey, false).slice(1).toString('hex');
  }

  static ecrecoverAddress(hash, ecsig) {
    const publicKey = BPrivacy.ecrecover(hash, ecsig);
    const address = BPrivacy.publicKeyToAddress(publicKey);
    return address;
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
    assert(isBytes(remoteKey), `Remote key must represent bytes (hex, hex0x or buffer), got ${kindOf(remoteKey)}.`);
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
