const c = console
const BPrivacy = require('../src/b-privacy.js')
const localStorageMock = {}
let mnemonicTmp

const examplePhrase = "aspect else project orient seed doll admit remind library turkey dutch inhale"

test('initializes', () => {
  const bp = new BPrivacy({store: localStorageMock})
  expect(bp.isBrowser).toBe(true)
  mnemonicTmp = bp.mnemonicKey.phrase
})

test('generates and saves hd key', () => {
  const bp = new BPrivacy({store: localStorageMock})
  const mnemonic = localStorageMock.ab_hd_private_key_mnemonic
  expect(mnemonic).toBeDefined()
  expect(typeof mnemonic).toBe("string")
  expect(mnemonic).toBe(mnemonicTmp)
})

test('derives a mnemonic key/phrase', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveMnemonic()
  const mnemo = bp.mnemonicKey.phrase
  expect(mnemo).toBeDefined()
  expect(mnemo.toString().split(/\s+/)).toHaveLength(12) // 12 words key/phrase
})

test('derives the first private key, public key and address', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveKey()
  const key = bp.pvtKey
  expect(key).toBeDefined()
  expect(key.toString()).toHaveLength(64)
  const pubKey = bp.pubKey
  expect(pubKey).toBeDefined()
  expect(pubKey.toString()).toHaveLength(66)
  const address = bp.address
  expect(address).toBeDefined()
  expect(address.toString()).toHaveLength(42)
})

test('signs a message', () => {
  const bp = new BPrivacy({store: localStorageMock})
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
  const bp = new BPrivacy({store: localStorageMock})
  const hash = bp.sha3("message123")
  const expectedHash = "d860e63c5c69590c1a3184336cafdcd5ea84111b78268e71ed9a623d45be37fa"

  expect(hash).toHaveLength(64)
  expect(hash).toBe(expectedHash)
})

test('derives the correct address (at index 0)', () => {
  const store = { ab_hd_private_key_mnemonic: examplePhrase }
  const bp = new BPrivacy({store: store})
  bp.deriveKey()
  const address = bp.address
  expect(address).toBeDefined()
  expect(address.toString()).toBe("0xfdc7867dac261b3ee47fcd00b4f94a525ff5db1c")
})

test('signs a message via web3Sign', () => {
  const store = { ab_hd_private_key_mnemonic: examplePhrase }
  const bp = new BPrivacy({store: store})
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
