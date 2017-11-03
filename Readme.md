## Summary

B Privacy js library, supported runtimes: nodejs, react-native and browser.

Supports:
* generating new accounts `new B({ mnemonic: B.generateMnemonicPhrase() })`
* restoring accounts from mnemonic `new B({ mnemonic })`
* access to mnemonic, private key, public key and ethereum address `[a.mnemonic, a.privateKey, a.publicKey, a.address]`
* asymmetric encryption `a.encrypt(msg, b.publicKey)`
* asymmetric decryption `b.decrypt(msg, a.publicKey)`
* signing `s = a.sign(msg)` (alternatively `s = a.web3Sign(msg)` to get 0x-prefixed, single blob instead of `{ r, s, v }` object in case of `sign`)
* --verifying signature `b.verify(s, a.publicKey)`--
* deriving address from public key `B.publicKeyToAddress(publicKey)`

## Installation

    npm i -D git+ssh://git@github.com:appliedblockchain/b-privacy-js.git#v0.2.1

## Usage

    const assert = require('assert');
    const B = require('b-privacy');

    // Create accounts.
    const alice = new B({ mnemonic: B.generateMnemonicPhrase() });
    const bob = new B({ mnemonic: B.generateMnemonicPhrase() });

    // Alice encrypts a message for Bob.
    const encrypted = alice.encrypt({ foo: "bar" }, bob.publicKey);

    // Bob decrypts message from Alice.
    assert.deepEqual(
      bob.decrypt(encrypted, alice.publicKey),
      { foo: "bar" }
    );

For more usage examples please refer to tests in `test` directory.

---

_We'll need to clean-up below docs_

Blockchain Privacy JS library

Provides an easy way to interact with keys and sign messages (note: storage of keys should be handled outside this library)

### Development

    npm run dev

### Build

Package the library for release (browser/node)

    npm run build

## Testing

    npm test

or:

    npm i -g jest

    jest


### Browser Usage

Please require `dist/b-privacy.iife.js`, that's the browser-ready version.

You also need to include `bitcore-lib` manually before that. See `test/browser.index.html` for a working example.


To make the example work you need to build bitcore-lib for the browser, run:

    cd node_modules/bitcore-lib
    npm i
    gulp browser


### Usage
Storage of the key should be handled

```
var phrase = BPrivacy.generateMnemonicPhrase(); // "monkey flip moral arrow cannon icon embody muffin ski train cool spray"
var bp = new BPrivacy({mnemonic: phrase});
bp.address // "0xe0717674db78370b93af791216c8bbbd871a9091"
bp.pubKey.toString(); // "030b98a725efa7378398067c79e5d67f6a068dcb2b9ca36f4a19b3557c34955de6"
bp.pvtKey.toString(); // "ce2d46332c210aae80bffb88df33466b670705b0d244c99cdb235c190d05aa15"
signed_message = bp.sign("abc") // {r: Uint8Array(32), s: Uint8Array(32), v: 27}
```
