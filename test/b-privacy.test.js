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

test('signs a message (web3 format)', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveKey()
  const signature = bp.web3Sign("abc")
  expect(signature).toBeDefined()
  expect(signature).toHaveLength(132)
})

test('encrypts and sign data', () => {
  const bp = new BPrivacy({store: localStorageMock})
  bp.deriveKey()
  const publicData  = JSON.stringify({ public: true })
  const privateData = JSON.stringify({ private: true })
  const readerAddresses = []
  const data = bp.encryptAndSign({
    publicData: publicData,
    privateData: privateData,
    readerAddresses: readerAddresses,
  })
  expect(data.publicData).toBeDefined()
  expect(data.publicData).toBe(publicData)
  expect(data.privateData).toBeDefined()
  expect(data.privateData).not.toBe(privateData)
  expect(data.privateData).toHaveLength(24)
  expect(data.privateData.substr(-2)).toBe("==")
  expect(data.iv).toBeDefined()
  expect(data.iv).toHaveLength(16)
  expect(data.readers).toBeDefined()
  expect(data.readers).toContain(bp.address)
  expect(data.readers).toHaveLength(1)
  expect(data.signature).toBeDefined()
  expect(data.signature.s).toBeDefined()
  expect(data.signature.s).toHaveLength(32)
  expect(data.signature.r).toBeDefined()
  expect(data.signature.r).toHaveLength(32)
  expect(data.signature.v).toBeDefined()
  expect([27, 28]).toContain(data.signature.v)
})
