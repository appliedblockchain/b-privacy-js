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
  expect(hdKeySeed).not.toBeNull()
  expect(typeof hdKeySeed).toBe("string")
  expect(hdKeySeed).toBe(hdKeySeedTmp)
})

test('derives a mnemonic key/phrase', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveMnemonic()
  const mnemo = bp.mnemonicKey
  expect(mnemo).not.toBeNull()
  expect(mnemo.toString().split(/\s+/).length).toBe(12) // 12 words key/phrase
})

test('derives the first private key, public key and address', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveKey()
  const key = bp.pvtKey
  expect(key).not.toBeNull()
  expect(key.toString().length).toBe(64)
  const pubKey = bp.pubKey
  expect(pubKey).not.toBeNull()
  expect(pubKey.toString().length).toBe(66)
  const address = bp.address
  expect(address).not.toBeNull()
  expect(address.toString().length).toBe(42)
})

test('signs a message', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveKey()
  const signature = bp.sign("abc")
  expect(signature).not.toBeNull()
  expect(signature.s).not.toBeNull()
  expect(signature.s.length).toBe(32)
  expect(signature.r).not.toBeNull()
  expect(signature.r.length).toBe(32)
  expect(signature.v).not.toBeNull()
  expect([27, 28]).toContain(signature.v)
})

test('signs a message (web3 format)', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveKey()
  const signature = bp.web3Sign("abc")
  expect(signature).not.toBeNull()
  expect(signature.length).toBe(132)
})
