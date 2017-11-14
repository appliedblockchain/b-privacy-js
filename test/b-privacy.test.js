const c = console
const BPrivacy = require('../src/b-privacy.js')
const localStorageMock = {}
let mnemonicTmp
const { toHex0x, toBuffer } = require('../src/core');

const examplePhrase = "aspect else project orient seed doll admit remind library turkey dutch inhale"

test('initializes when given a valid mnemonic', () => {
  const mnemonicPhrase = BPrivacy.generateMnemonicPhrase();
  const bp = new BPrivacy({mnemonic: mnemonicPhrase})
  expect(bp.isBrowser).toBe(true)
  expect(bp.mnemonicKey.phrase).toEqual(mnemonicPhrase)
})

test('should fail when given a invalid mnemonic', () => {
  const fakeMnemonicPhrase = "become reason clog below only pair identify combine tortoise pizza maple invalid"
  expect(() => {
    new BPrivacy({mnemonic: mnemonicPhrase});
  }).toThrow();
})

test('should fail when not given a mnemonic', () => {
  expect(() => {
    new BPrivacy();
  }).toThrow();
})

test('derives a mnemonic key when given a phrase', () => {
  const firstMnemo = BPrivacy.generateMnemonicPhrase()
  const bp = new BPrivacy({mnemonic: firstMnemo})
  const secondMnemo = BPrivacy.generateMnemonicPhrase()
  bp.deriveMnemonic(secondMnemo)
  const derivedMnemo = bp.mnemonicKey.phrase
  expect(derivedMnemo).toBeDefined()
  expect(derivedMnemo.toString().split(/\s+/)).toHaveLength(12) // 12 words key/phrase
  expect(derivedMnemo).toEqual(secondMnemo)
  expect(derivedMnemo).not.toEqual(firstMnemo)
})

test('generates a 12 work mnemoic phrase', () => {
  const phrase = BPrivacy.generateMnemonicPhrase()
  expect(phrase).toBeDefined()
  expect(phrase.split(/\s+/)).toHaveLength(12)
});

test('derives the first private key, public key and address', () => {
  const mnemonicPhrase = BPrivacy.generateMnemonicPhrase();
  const bp = new BPrivacy({mnemonic: mnemonicPhrase})
  const key = bp.pvtKey
  expect(key).toBeDefined()
  // We use to 0x prefix for all
  expect(toHex0x(key)).toHaveLength(66)
  const pubKey = bp.pubKey
  expect(pubKey).toBeDefined()
  expect(toHex0x(pubKey)).toHaveLength(130)
  const address = bp.address
  expect(address).toBeDefined()
  expect(address.toString()).toHaveLength(42)
})

test('signs a message', () => {
  const mnemonicPhrase = BPrivacy.generateMnemonicPhrase();
  const bp = new BPrivacy({mnemonic: mnemonicPhrase})
  bp.deriveKey()
  const signature = bp.sign("abc")
  expect(signature).toBeDefined()
  expect(signature.s).toBeDefined()
  expect(signature.s).toHaveLength(32)
  expect(signature.r).toBeDefined()
  expect(signature.r).toHaveLength(32)
  expect(signature.v).toBeDefined()
  expect([27, 28]).toContain(signature.v)
})

test("exposes sha3", () => {
  const mnemonicPhrase = BPrivacy.generateMnemonicPhrase();
  const bp = new BPrivacy({mnemonic: mnemonicPhrase})
  const hash = bp.sha3("message123")
  const expectedHash = "d860e63c5c69590c1a3184336cafdcd5ea84111b78268e71ed9a623d45be37fa"

  expect(hash).toHaveLength(64)
  expect(hash).toBe(expectedHash)
})

test('derives the correct address (at index 0)', () => {
  const bp = new BPrivacy({mnemonic: examplePhrase})
  bp.deriveKey()
  const address = bp.address
  expect(address).toBeDefined()
  expect(address.toString()).toBe("0xfdc7867dac261b3ee47fcd00b4f94a525ff5db1c")
})

test('signs a message via web3Sign', () => {
  const bp = new BPrivacy({mnemonic: examplePhrase})
  bp.deriveKey()
  const message = "a"
  const msgSignature = bp.web3Sign(message)
  const expectedSignature = "0x1c1931b8a3c91af0afae485d8ce5b597c5f2424f2bb3055b56e0204790047dd85379bce18b7279a04a1674d4bbfc302a5a68fb497da4a90bd924991bbeb7db1b1b"

  expect(msgSignature).toBeDefined()
  expect(msgSignature).toBe(msgSignature)
  // example signed message parts - messageHash, msgSignature, signerAddress:
  // c.log(`0x${bp.sha3(message)}`, messageSigned, bp.address)
  // optput: 0x3ac225168df54212a25c1c01fd35bebfea408fdac2e31ddd6f80a4bbf9a5f1cb 0x1c1931b8a3c91af0afae485d8ce5b597c5f2424f2bb3055b56e0204790047dd85379bce18b7279a04a1674d4bbfc302a5a68fb497da4a90bd924991bbeb7db1b1b 0xfc86f571353e44568aa9103db4edd7f53a410c73
})

test('converts a stringified public_key (without 0x prefix) to an address', () => {
  const bp = new BPrivacy({mnemonic: examplePhrase})
  let staticAddress = BPrivacy.publicKeyToAddress(bp.pubKey.toString());
  expect(staticAddress).toEqual(bp.address);
});

test('converts a stringified public_key (with 0x prefix) to an address', () => {
  const bp = new BPrivacy({mnemonic: examplePhrase})
  let staticAddress = BPrivacy.publicKeyToAddress(`0x${bp.pubKey.toString()}`);
  expect(staticAddress).toEqual(bp.address);
});
