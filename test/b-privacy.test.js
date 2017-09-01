const c = console
const BPrivacy = require('../src/b-privacy.js')
const localStorageMock = {}
let hdKeySeedTmp

test('initializes', () => {
  const bp = new BPrivacy({store: localStorageMock})
  expect(bp.isBrowser).toBe(true)
  hdKeySeedTmp = bp.hdKeySeed.toString()
})

test('generates and saves hd key', () => {
  const bp = new BPrivacy({store: localStorageMock})
  const hdKeySeed = new Buffer(localStorageMock.ab_hd_private_key_seed, "hex").toString()
  expect(hdKeySeed).toBeDefined()
  expect(typeof hdKeySeed).toBe("string")
  expect(hdKeySeed).toBe(hdKeySeedTmp)
})

test('derives a mnemonic key/phrase', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveMnemonic()
  const mnemo = bp.mnemonicKey
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
  expect(hash).toHaveLength(64)
  expect(hash).toBe("d860e63c5c69590c1a3184336cafdcd5ea84111b78268e71ed9a623d45be37fa")
})
