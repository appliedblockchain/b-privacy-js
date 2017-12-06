
const Mnemonic = require('bitcore-mnemonic')

/**
 * Generates mnemonic phrase.
 *
 * @return {string} Generated mnemonic phrase.
 */
function makeMnemonic() {
  return new Mnemonic().phrase
}

module.exports = makeMnemonic
