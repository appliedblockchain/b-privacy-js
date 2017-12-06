const B = require('../src/b-privacy.js')
const toHex0x = require('../src/core/to-hex0x')
const bufferToHex0x = require('../src/core/buffer-to-hex0x')
const hex0xToBuffer = require('../src/core/hex0x-to-buffer')
const { t, f } = require('./helpers')
const randomBytes = require('../src/core/random-bytes')
const utf8ToKeccak256 = require('../src/core/utf8-to-keccak256')
const debug = require('debug')('b-privacy:test')

const examplePhrase = 'aspect else project orient seed doll admit remind library turkey dutch inhale'

describe('B', function () {

  it('initializes when given a valid mnemonic', () => {
    const mnemonic = B.generateMnemonicPhrase()
    const b = new B({ mnemonic })
    t(b.mnemonicKey.phrase, mnemonic)
  })

  it('should fail when given a invalid mnemonic', () => {
    const mnemonic = 'become reason clog below only pair identify combine tortoise pizza maple invalid'
    t(() => new B({ mnemonic }), Error, 'Should throw for fake mnemonic.')
  })

  it('derives a mnemonic key when given a phrase', () => {
    const firstMnemo = B.generateMnemonicPhrase()
    const bp = new B({mnemonic: firstMnemo})
    const secondMnemo = B.generateMnemonicPhrase()
    bp.deriveMnemonic(secondMnemo)
    const derivedMnemo = bp.mnemonicKey.phrase
    t(derivedMnemo != null)
    t(derivedMnemo.split(/\s+/).length, 12, '12 words phrase.')
    t(derivedMnemo, secondMnemo)
    f(derivedMnemo, firstMnemo)
  })

  it('generates a 12 work mnemoic phrase', () => {
    const phrase = B.generateMnemonicPhrase()
    t(phrase != null)
    t(phrase.split(/\s+/).length, 12, '12 words phrase.')
  })

  it('derives the first private key, public key and address', () => {
    const mnemonic = B.generateMnemonicPhrase()
    const bp = new B({ mnemonic })
    const key = bp.pvtKey
    t(key != null)
    t(toHex0x(key).length, 2 + 2 * 32)
    const pubKey = bp.pubKey
    t(pubKey != null)
    t(toHex0x(pubKey).length, 2 + 2 * 2 * 32)
    const address = bp.address
    t(address != null)
    t(typeof address, 'string')
    t(address.length, 2 + 2 * 20)
  })

  it('signs a message', () => {
    const a = B.generate()
    const b = B.generate()
    const msg = 'Hello world.'
    const hash = utf8ToKeccak256(msg)
    const sig = a.ecsign(hash)
    t(a.ecverify(hash, sig))
    f(b.ecverify(hash, sig))
  })

  it('exposes sha3', () => {
    const mnemonic = B.generateMnemonicPhrase()
    const bp = new B({ mnemonic })
    const hash = bp.sha3('message123')
    const expectedHash = 'd860e63c5c69590c1a3184336cafdcd5ea84111b78268e71ed9a623d45be37fa'
    t(hash, expectedHash)
  })

  it('derives the correct address (at index 0)', () => {
    const b = new B({ mnemonic: examplePhrase })
    b.deriveKey()
    t(b.address, '0xfdc7867DAc261b3EE47FCd00b4F94a525FF5DB1c')
  })

  it('signs with known signature', () => {
    const a = B.fromMnemonic(examplePhrase)
    a.deriveKey()
    const msg = 'a'
    const sig = a.ecsign(utf8ToKeccak256(msg))
    const expectedSig = '0x935080d1b2c7f748b9343250a4e7cb73cd812016a9782bb710810a96705d73b17aa9b6d3a27d8d902c9854327b4c74bedabb31bd34a741fd51fd90a6db894cbc1c'
    t(sig, expectedSig)
  })

  it('converts a public_key to an address', () => {
    const bp = new B({ mnemonic: examplePhrase })
    const staticAddress = B.publicKeyToAddress(bp.pubKey)
    t(staticAddress, bp.address)
  })

  it('should handle zero-padded private keys', () => {
    const b = new B({ mnemonic: 'letter giraffe harvest lift test giraffe quit fiscal carpet armed script milk' })
    t(b.pvtKey.toString('hex'), '00c22bc1b06fea6e01d24e5b3fce1f3bc07b180bc3f73d513330acc812142e90')
  })

  it('should generate checksummed address', () => {
    const b = new B({ mnemonic: examplePhrase })
    t(b.address, '0xfdc7867DAc261b3EE47FCd00b4F94a525FF5DB1c')
  })

  describe('ecsign', function () {

    it('should sign and recover', () => {
      const b = new B({ mnemonic: examplePhrase })
      const hash = B.keccak256('abc')
      const sig = b.ecsign(hash)
      const address = B.ecrecoverAddress(hash, sig)
      t(address, b.address)
    })

  })

  describe('simulate sharing for multiple readers', () => {
    const b = new B({ mnemonic: examplePhrase })
    const secret = randomBytes(32)
    const msg = { hello: 'world' }
    const blob = B.encryptSymmetric(msg, secret)
    const readerBlob = b.encrypt(bufferToHex0x(secret), b.publicKey)
    debug('b.encrypt -> readerBlob', readerBlob)
    const decryptedSecret = hex0xToBuffer(b.decrypt(readerBlob))
    t(toHex0x(decryptedSecret), toHex0x(secret))
    const decryptedMsg = B.decryptSymmetric(blob, secret)
    t(decryptedMsg, msg)
  })

  describe('call sig', () => {

    it('should create call signature', () => {
      const a = new B({ mnemonic: B.generateMnemonicPhrase() })
      const b = new B({ mnemonic: examplePhrase })
      const args = ['foo', 'hello', true, 42]
      const sig = b.callSignature(...args)
      t(b.verifyCallSignature(sig, ...args))
      f(b.verifyCallSignature(sig, 'x', ...args))
      f(a.verifyCallSignature(sig, ...args))
    })

  })

  describe('symmetric encryption/decryption', () => {

    it('should work for simple case', () => {
      const secret = randomBytes(32)
      const blob = B.encryptSymmetric({ msg: 'foo+bar' }, secret)
      const msg = B.decryptSymmetric(blob, secret)
      t(msg, { msg: 'foo+bar' })
    })

  })

  describe('encryption for sharing', () => {

    it('should work', () => {
      const a = new B({ mnemonic: B.generateMnemonicPhrase() })
      const b = new B({ mnemonic: B.generateMnemonicPhrase() })

      const [ blob, aReaderBlob ] = a.encryptShared({ hello: 'world' })
      t(a.decryptShared(blob, aReaderBlob), { hello: 'world' })
      t(() => b.decryptShared(blob, aReaderBlob), 'Tag mismatch.')

      // Share secret with b.
      const bReaderBlob = a.shareSecret(aReaderBlob, b.publicKey)
      t(b.decryptShared(blob, bReaderBlob), { hello: 'world' })
      t(() => a.decryptShared(blob, bReaderBlob), 'Tag mismatch.')
    })

  })

})
