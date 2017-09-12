const c = console
const bitcore = require('bitcore-lib')
const HDPrivateKey = bitcore.HDPrivateKey
const PrivateKey = bitcore.PrivateKey
const Random = require('bitcore-lib/lib/crypto/random')
const Mnemonic = require('bitcore-mnemonic')
const EthereumBip44 = require('ethereum-bip44/es5')
const util = require('ethereumjs-util')

class BPrivacy {

  constructor({store = localStorage, isBrowser = true}) {
    // logging - change to `this.log = true/false` to enable/suppress logs
    this.log = false
    // defines whether we're running in the browser or on a mobile environment (React-Native)
    this.isBrowser = isBrowser
    this.store = store
    // all instance variables/attributes (for reference)
    this.hdKeySeed = null
    this.hdKey = null
    this.mnemonicKey = null
    this.keyIdx = null
    this.pvtKey = null
    this.pubKey = null
    this.address = null

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
    this.hdKey = hdKey
  }

  loadHdKey() {
    this.p("Load key")
    const hdKeySeed = new Buffer(this.store.ab_hd_private_key_seed, "hex")
    const hdKey = HDPrivateKey.fromSeed(hdKeySeed)
    this.hdKeySeed = hdKeySeed
    this.hdKey = hdKey
  }

  deriveMnemonic() {
    const wordlist = Mnemonic.Words.ENGLISH
    const mnemonicKey = Mnemonic.fromSeed(this.hdKeySeed, wordlist)
    this.mnemonicKey = mnemonicKey
    return mnemonicKey
  }

  // derive first private key
  deriveKey() {
    const account = 0  // we leave the account bit not used (always set to 0) at the moment - we don't plan to use multiple accounts for now as we just increase the address index for now
    const index = 0  // starts at zero - we will increment the address index for every key the user needs
    const coinType = 60 // 60 - ethereum - *note4
    const change = 0 // 0 - false - private address
    const pathLevel = `44'/${coinType}'/${account}'/${change}` // *note2
    const derivedChild = this.hdKey.derive(`m/${pathLevel}/${index}`)
    const pvtKey = derivedChild.privateKey
    this.pvtKey = pvtKey
    this.pubKey = pvtKey.publicKey
    this.keyIdx = index
    this.deriveEthereumAddress()
    return pvtKey
  }

  deriveEthereumAddress() {
    const eBip44 = EthereumBip44.fromPrivateSeed(this.hdKey.toString())
    const address = eBip44.getAddress(this.keyIdx)
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

  sha3(string) {
    return util.sha3(string).toString("hex")
  }

  // private

  p(message) {
    if (this.log) c.log(message.toString())
  }

}


module.exports = BPrivacy


if (process.browser) window.BPrivacy = BPrivacy
