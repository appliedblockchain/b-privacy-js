const c = console
const bitcore = require('bitcore-lib')
const HDPrivateKey = bitcore.HDPrivateKey
const Random = require('bitcore-lib/lib/crypto/random')
const Mnemonic = require('bitcore-mnemonic')

class BPrivacy {

  constructor({store = localStorage, isBrowser = true}) {
    this.log = true
    // this.log = false
    this.isBrowser  = isBrowser // whether we're running in the browser or on a mobile environment (React-Native)
    this.store        = store
    this.hdKeySeed    = null
    this.hdKey        = null
    this.mnemonicKey  = null

    this.setupHDKey()
  }

  setupHDKey() {
    const hdKeySeed = this.store.ab_hd_private_key_seed
    if (!hdKeySeed || hdKeySeed == "") {
      this.generateHDKey()
    } else {
      this.loadHdKey()
    }
  }

  generateHDKey() {
    this.p("Gen key")
    const hdKeySeed = Random.getRandomBuffer(16) // 16 bytes (128 bits) seed for a 12 words seed - note: a value higher than that doesn't provides additional security because 256 bit keys of bitcoin are only 128 bits strong
    const hdKey = HDPrivateKey.fromSeed(hdKeySeed)
    this.store.ab_hd_private_key_seed = hdKeySeed.toString("hex")
    this.hdKeySeed  = hdKeySeed
    this.hdKey      = hdKey
  }

  loadHdKey() {
    this.p("Load key")
    const hdKeySeed = new Buffer(this.store.ab_hd_private_key_seed, "hex")
    const hdKey     = HDPrivateKey.fromSeed(hdKeySeed)
    this.hdKeySeed  = hdKeySeed
    this.hdKey      = hdKey
  }

  deriveMnemonic() {
    const wordlist    = Mnemonic.Words.ENGLISH
    const mnemonicKey = Mnemonic.fromSeed(this.hdKeySeed, wordlist)
    c.log(mnemonicKey)
    this.mnemonicKey = mnemonicKey
  }

  // private

  p(message) {
    if (this.log) c.log(message.toString())
  }

}


module.exports = BPrivacy
