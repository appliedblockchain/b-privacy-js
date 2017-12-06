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
const { encrypt, decrypt } = require('./asymmetric-encryption')
const secp256k1 = require('secp256k1')
const assert = require('assert')

const areAddressesEqual = require('./core/are-addresses-equal')
const bufferToHex0x = require('./core/buffer-to-hex0x')
const bufferToKeccak256 = require('./core/buffer-to-keccak256')
const callHash = require('./core/call-hash')
const decryptSymmetric = require('./core/decrypt-symmetric')
const encryptSymmetric = require('./core/encrypt-symmetric')
const hex0xToBuffer = require('./core/hex0x-to-buffer')
const isBuffer = require('./core/is-buffer')
const isHex0x = require('./core/is-hex0x')
const isPublicKey = require('./core/is-public-key')
const isString = require('./core/is-string')
const kindOf = require('./core/kind-of')
const randomBytes = require('./core/random-bytes')
const toBuffer = require('./core/to-buffer')
const toChecksumAddress = require('./core/to-checksum-address')
const toHex = require('./core/to-hex')
const toHex0x = require('./core/to-hex0x')

// const debug = require('debug')('b-privacy')

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
      this.deriveKey()
    } else {
      throw Error('Mnemonic phrase was not provided.')
    }
  }

  static generateMnemonicPhrase() {
    return new Mnemonic().phrase
  }

  // TODO: Remove me.
  static keccak256(value) {
    if (isBuffer(value)) {
      return bufferToKeccak256(value)
    }
    if (isString(value)) {
      return bufferToKeccak256(Buffer.from(value, 'utf8'))
    }
    throw new TypeError(`Invalid input type ${typeof value}.`)
  }

  static toChecksumAddress(address) {
    return toChecksumAddress(address)
  }

  static publicKeyToAddress(publicKey) {
    return toChecksumAddress(toHex0x(util.pubToAddress(toHex0x(publicKey), true)))
  }

  static areAddressesEqual(a, b) {
    return toChecksumAddress(a) === toChecksumAddress(b)
  }

  deriveMnemonic(mnemonic) {
    const wordlist = Mnemonic.Words.ENGLISH
    const mnemonicKey = new Mnemonic(mnemonic, wordlist)
    this.mnemonicKey = mnemonicKey
    const hdKey = mnemonicKey.toHDPrivateKey()
    this.hdKey = hdKey
    return mnemonicKey
  }

  // derive first private key
  deriveKey() {

    // We leave the account bit not used (always set to 0) at the moment - we don't plan to use multiple accounts for
    // now as we just increase the address index.
    const account = 0
    const index = 0  // starts at zero - we will increment the address index for every key the user needs
    const coinType = 60 // 60 - ethereum - *note4
    const change = 0 // 0 - false - private address
    const pathLevel = `44'/${coinType}'/${account}'/${change}` // *note2
    const derivedChild = this.hdKey.derive(`m/${pathLevel}/${index}`)
    const pvtKey = derivedChild.privateKey
    this.pvtKeyBtc = pvtKey
    this.pvtKey = pvtKey.bn.toBuffer({ size: 32 })
    this.pubKey = this.deriveEthereumPublicKey()
    this.keyIdx = index
    this.address = this.deriveEthereumAddress()
  }

  get privateKey() {
    return this.pvtKey
  }

  // @returns {buffer} Public key, uncompressed format.
  get publicKey() {
    return this.pubKey
  }

  getPublicKey(encoding) {
    switch (encoding) {
      case 'buffer':
        return this.publicKey
      case 'hex0x':
        return toHex0x(this.publicKey)
      case 'hex':
        return toHex(this.publicKey)
      default:
        throw new TypeError(`Unknown encoding ${encoding}, expected "buffer", "hex0x" or "hex".`)
    }
  }

  deriveEthereumPublicKey() {
    return util.privateToPublic(this.pvtKey)
  }

  deriveEthereumAddress() {
    const eBip44 = EthereumBip44.fromPrivateSeed(this.hdKey.toString())
    const address = eBip44.getAddress(this.keyIdx)
    return toChecksumAddress(address)
  }

  // TODO: Remove, use ecsign(...).
  sign(message) {
    const msgHash = util.sha3(message)
    const signature = util.ecsign(msgHash, this.pvtKey)
    return signature
  }

  // TODO: Remove, use ecsign(...).
  web3Sign(message) {
    const sig = this.sign(message)
    const r = sig.r.toString('hex')
    const s = sig.s.toString('hex')
    const v = Buffer.from([sig.v]).toString('hex')
    return `0x${r}${s}${v}`
  }

  // Signs message hash.
  // @param hash {hex0x} keccak256 of the message.
  // @returns {hex0x} ecsig (r + s + v blob).
  ecsign(hash) {
    const hashBuf = toBuffer(hash)
    const { signature, recovery } = secp256k1.sign(hashBuf, this.pvtKey)
    const r = signature.slice(0, 32).toString('hex')
    const s = signature.slice(32, 64).toString('hex')
    const v = Buffer.from([ recovery + 27 ]).toString('hex')
    return '0x' + r + s + v
  }

  // @param hash {hex0x} keccak256 of the message.
  // @param sig {hex0x} Signature blob (message hash + r + s + v; 32 + 32 + 32 + 1 bytes).
  // @returns {hex0x} Public key.
  static ecrecover(hash, ecsig) {

    // Get hash buffer.
    const hashBuf = toBuffer(hash)
    if (hashBuf.length !== 32) {
      throw new TypeError(`Invalid message hash buffer length ${hashBuf.length}, expected 32.`)
    }

    // Parse ecsig hex0x into buffer.
    const ecsigBuf = Buffer.from(ecsig.slice(2), 'hex')
    if (ecsigBuf.length !== 32 + 32 + 1) {
      throw new TypeError(`Invalid signature buffer length ${ecsigBuf.length}, expected (32 + 32 + 1).`)
    }

    // Extract signature (r + s) and recovery (v).
    const signature = ecsigBuf.slice(0, 64)
    const recovery = ecsigBuf[64] - 27
    if (recovery !== 0 && recovery !== 1) {
      throw new Error('Invalid recovery value, expected 0 or 1.')
    }

    // Recover public key.
    const publicKey = secp256k1.recover(hashBuf, signature, recovery)
    return '0x' + secp256k1.publicKeyConvert(publicKey, false).slice(1).toString('hex')
  }

  static ecrecoverAddress(hash, ecsig) {
    const publicKey = BPrivacy.ecrecover(hash, ecsig)
    const address = BPrivacy.publicKeyToAddress(publicKey)
    return address
  }

  sha3(string) {
    return util.sha3(string).toString('hex')
  }

  _p(message) {
    if (this.log) c.log(message.toString())
  }

  static encrypt(input, privateKey, remoteKey) {
    return encrypt(input, privateKey, remoteKey)
  }

  static decrypt(input, privateKey) {
    return decrypt(input, privateKey)
  }

  /**
   * Encrypts `value` using `this.privateKey` and provided reader's public key (`remoteKey`).
   *
   * @param {any} input     [description]
   * @param {buffer | hex | hex0x} remoteKey
   * @return {buffer}
   */
  encrypt(input, remoteKey) {
    assert(isPublicKey(remoteKey), `Invalid remote public key, got ${kindOf(remoteKey)}.`)
    return BPrivacy.encrypt(input, this.pvtKey, remoteKey)
  }

  // Decrypts `input` message using `BPrivacy`'s private key.
  decrypt(input) {
    return BPrivacy.decrypt(input, this.pvtKey)
  }

  /**
   * @see encryptSymmetric
   */
  static encryptSymmetric(...args) {
    return encryptSymmetric(...args)
  }

  /**
   * @see decryptSymmetric
   */
  static decryptSymmetric(...args) {
    return decryptSymmetric(...args)
  }

  /**
   * @see callHash
   */
  static callHash(...args) {
    return callHash(...args)
  }

  /**
   * Generates call signature from a list of `args`.
   *
   * In normal usage the first argument is a function name. More "prefixes" can be used, ie. module name, class name,
   * etc. - it really doesn't matter as long as the list of arguments match on both sides.
   *
   * It's common to use nonce as part of signature to avoid replay attacks.
   *
   * @param {any[]} args
   * @return {hex0x} Signature.
   */
  callSignature(...args) {
    const hash = callHash(...args)
    const sig = this.ecsign(hash)
    return sig
  }

  /**
   * Checks if provided signature `sig` for `...args` list of arguments has been created by `this`.
   *
   * @param { buffer | hex0x | hex } sig
   * @param { any[] } args
   * @return {boolean}
   */
  verifyCallSignature(sig, ...args) {
    const hash = callHash(...args)
    const address = BPrivacy.ecrecoverAddress(hash, sig)
    return areAddressesEqual(this.address, address)
  }

  /**
   * Encrypts `value` with encrypted secret.
   *
   * Returns a tuple with encrypted data (blob) and encrypted secret (readerBlob) to decode that data.
   *
   * @param {any} value
   * @return {[ blob, readerBlob ]}
   */
  encryptShared(value) {
    const secret = randomBytes(32)
    const blob = encryptSymmetric(value, secret)
    const readerBlob = this.encrypt(bufferToHex0x(secret), this.publicKey)
    return [ blob, readerBlob ]
  }

  /**
   * Decrypts `blob` using shared secret encrypted in `readerBlob`.
   *
   * @param {buffer | hex0x | hex} blob Encrypted message.
   * @param {buffer | hex0x | hex} readerBlob
   * @return {any} Decrypted message.
   */
  decryptShared(blob, readerBlob) {
    if (isHex0x(blob) && isHex0x(readerBlob)) {
      return this.decryptShared(hex0xToBuffer(blob), hex0xToBuffer(readerBlob))
    }
    const secret = hex0xToBuffer(this.decrypt(readerBlob))
    const value = decryptSymmetric(blob, secret)
    return value
  }

  /**
   * Generates encrypted secret for other reader.
   *
   * @param {buffer | hex0x | hex} readerBlob Encrypted secret readable by `this`.
   * @param {buffer | hex0x | hex} publicKey Remote public key that the secret is shared with.
   * @return {typeof readerBlob} Encrypted secret readable by `publicKey` owner.
   */
  shareSecret(readerBlob, publicKey) {
    const secret = this.decrypt(readerBlob)
    const otherReaderBlob = this.encrypt(secret, publicKey)
    return otherReaderBlob
  }

}

module.exports = BPrivacy

// Export module as global when loaded in browser environment.
// TODO: Is this the right way to do it? [MR]
if (process.browser) window.BPrivacy = BPrivacy // eslint-disable-line no-undef
