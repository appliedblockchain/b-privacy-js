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
    this.hdKey = null
    this.mnemonicKey = null
    this.keyIdx = null
    this.pvtKey = null
    this.pubKey = null
    this.address = null

    this.setupHDKey()
  }


  setupHDKey() {
    const mnemonic = this.store.ab_hd_private_key_mnemonic
    if (!mnemonic || mnemonic == "") {
      this.generateMnemonic()
      this.deriveMnemonic()
    } else {
      this.deriveMnemonic()
    }
  }

  generateMnemonic() {
    this._p("Gen key")
    const mnemonic = new Mnemonic()
    this.store.ab_hd_private_key_mnemonic = mnemonic.phrase
  }

  setMnemonic(mnemonicText) {
    if (Mnemonic.isValid(mnemonicText, Mnemonic.Words.ENGLISH)){
      this.store.ab_hd_private_key_mnemonic = mnemonicText
    } else{
      throw new Error('invalid mnemonic phrase')
    }
  }

  deriveMnemonic() {
    const wordlist = Mnemonic.Words.ENGLISH
    const mnemonicKey = new Mnemonic(this.store.ab_hd_private_key_mnemonic, wordlist)
    this.mnemonicKey = mnemonicKey
    const hdKey = mnemonicKey.toHDPrivateKey()
    this.hdKey = hdKey
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

  _p(message) {
    if (this.log) c.log(message.toString())
  }

}

module.exports = BPrivacy

// export module as global when loaded in browser environment
if (process.browser) window.BPrivacy = BPrivacy
