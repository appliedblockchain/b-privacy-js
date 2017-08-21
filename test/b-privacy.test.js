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
