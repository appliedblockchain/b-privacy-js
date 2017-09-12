```js
// b-privacy.js notes

// *note1: 16 bytes (128 bits) seed for a 12 words seed - note: a value higher than that doesn't provides additional security because 256 bit keys of bitcoin are only 128 bits strong

// *note2: this constructs a mnemonic path level - here are some infos on path levels: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki#path-levels - note we skip the change address bit as we don't usually deal with native chain tokens (test-eths) as we run PoA as consensus algo
// and here's the list of registered coin types: https://github.com/satoshilabs/slips/blob/master/slip-0044.md#registered-coin-types

// note3: this is the derived parent key (w/o index): this.hdKey.derive(`m/${pathLevel}`)

// *note4: TODO: this needs to be configurable so that this library is configured with a different coin type for every app we build (example 7160 for cygnetise, 7161 for cygnetise-staging, 7162 for sita, etc...)
```
