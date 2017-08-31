const c = console
const bitcore       = require('bitcore-lib')
const HDPrivateKey  = bitcore.HDPrivateKey
const PrivateKey    = bitcore.PrivateKey
const Random        = require('bitcore-lib/lib/crypto/random')
const Mnemonic      = require('bitcore-mnemonic')
const EthereumBip44 = require('ethereum-bip44/es5')
const util          = require('ethereumjs-util')

class BPrivacy {

  constructor({store = localStorage, isBrowser = true}) {
    // logging - change to `this.log = true/false` to enable/suppress logs
    this.log = false
    // defines whether we're running in the browser or on a mobile environment (React-Native)
    this.isBrowser  = isBrowser
    this.store        = store
    // all instance variables/attributes (for reference)
    this.hdKeySeed    = null
    this.hdKey        = null
    this.mnemonicKey  = null
    this.pvtKey       = null
    this.pubKey       = null
    this.address      = null
    this.keyIndex     = null

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
    const hdKeySeed = Random.getRandomBuffer(16) // *note1
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
    this.mnemonicKey = mnemonicKey
    return mnemonicKey
  }

  // derive first private key
  deriveKey() {
    const account  = 0    // we leave the account bit not used (always set to 0) at the moment - we don't plan to use multiple accounts for now as we just increase the address index for now
    const index    = 0    // starts at zero - we will increment the address index for every key the user needs
    const coinType = 7160 // TODO: this needs to be discussed and changed so that this library is configured with a different coin type for every app we build (example 7160 for cygnetise, 7161 for cygnetise-staging, 7162 for sita, etc...)
    const pathLevel = `44'/${coinType}'/${account}'` // *note2
    const derived   = this.hdKey.derive(`m/${pathLevel}/${index}`)
    const pvtKey    = derived.privateKey
    this.pvtKey     = pvtKey
    this.pubKey     = pvtKey.publicKey
    this.addressBtc = pvtKey.toAddress()
    this.keyIndex   = index
    this.deriveEthereumAddress({hdPubKey: derived.hdPublicKey})
    return pvtKey
  }

  deriveEthereumAddress({hdPubKey}) {
    const wallet = EthereumBip44.fromPublicSeed(hdPubKey.toString())
    const address = wallet.getAddress(this.keyIndex)
    this.address = address
    return
  }

  // returns a promise with one parameter, the message signature
  sign(message) {
    const msgHash = util.sha3(message)

    const signature = util.ecsign(msgHash, new Buffer(this.pvtKey.toString(), 'hex'))
    return signature
  }

  web3Sign(message) {
    const signature = this.sign(message)
    const r = signature.r.toString('hex')
    const s = signature.s.toString('hex')
    const v = Buffer.from([signature.v]).toString('hex')
    return `0x${r}${s}${v}`
  }

  // private

  p(message) {
    if (this.log) c.log(message.toString())
  }

}


module.exports = BPrivacy


// *note1: 16 bytes (128 bits) seed for a 12 words seed - note: a value higher than that doesn't provides additional security because 256 bit keys of bitcoin are only 128 bits strong

// *note2: this constructs a mnemonic path level - here are some infos on path levels: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels - note we skip the change address bit as we don't usually deal with native chain tokens (test-eths) as we run PoA as consensus algo
// and here's the list of registered coin types: https://github.com/satoshilabs/slips/blob/master/slip-0044.md#registered-coin-types
