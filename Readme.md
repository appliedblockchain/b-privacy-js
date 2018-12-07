## Summary

B Privacy js library, supported runtimes: nodejs, react-native and browser.

Supports:
* generating new accounts `new B({ mnemonic: B.generateMnemonicPhrase() })`
* restoring accounts from mnemonic `new B({ mnemonic })`
* access to mnemonic, private key, public key and ethereum address `[a.mnemonic, a.privateKey, a.publicKey, a.address]`
* asymmetric encryption `a.encrypt(msg, b.publicKey)`
* asymmetric decryption `b.decrypt(msg, a.publicKey)`
* signing `a.ecsign(B.keccak256(msg))`
* deriving address from public key `B.publicKeyToAddress(publicKey)`
* See usage for examples

## Conventions

We call `bytes` any byte representation: buffer, hex0x or hex.

`bytesTo*` family functions convert from one of known byte representations to specified one.

`to*` family functions will try to convert from any input into desired byte representation, when possible making
the same conversions as seen in solidity, ie.:

    toBuffer('hello') // returns buffer with utf8 representation of the input string
    toBuffer(true) // returns 32 byte, big-endian number 1
    toBuffer(false) // returns 32 byte number 0
    toBuffer(null) // throws
    toBuffer('0x01') // returns one byte buffer
    toBuffer('ffff') // returns two byte buffer

## Installation

    npm i --save @appliedblockchain/b-privacy

## Usage
```js
const assert = require('assert')
const B = require('@appliedblockchain/b-privacy')

const simon = new B({ mnemonic: B.generateMnemonicPhrase() })

// sign a message from an account
const helloHash = B.keccak256('hello')
const helloSig = simon.ecsign(helloHash)

// verify that i said hello
const didISayHello = simon.ecverify(helloHash, helloSig)
assert.equal(didISayHello, true)

// anyone can verify i said hello if they have my publicKey or address
const recoveredPublicKey = B.ecrecover(helloHash, helloSig)
assert.equal(recoveredPublicKey, simon.getPublicKey())
const recoveredAddress = B.ecrecoverAddress(helloHash, helloSig)
assert.equal(recoveredAddress, simon.address)

const mike = new B({ mnemonic: B.generateMnemonicPhrase() })
const hiMike = simon.encrypt({
  message: 'hello',
  another: 'key'
}, mike.publicKey)

const mikesMessage = mike.decrypt(hiMike, simon.publicKey)
assert.deepEqual(mikesMessage, { message: 'hello', another: 'key' })

const helloEveryone = { hello: 'everyone!' }
const [ sharedBlob, readerBlob ] = simon.encryptShared(helloEveryone)

// i can decrypt my own shared message, other people can't without calling shareSecret
assert.deepEqual(simon.decryptShared(sharedBlob, readerBlob), helloEveryone)

// providing a mnemonic is optional, if nothing provided then one will be generated
const bob = new B()
const bobReaderBlob = simon.shareSecret(readerBlob, bob.publicKey)

// bob can now decrypt the shared message
const bobsMessage = bob.decryptShared(sharedBlob, bobReaderBlob)
assert.deepEqual(bobsMessage, helloEveryone)

// bob can now pass the message on securely
const alice = new B()
const aliceReaderBlob = bob.shareSecret(bobReaderBlob, alice.publicKey)

const alicesMessage = alice.decryptShared(sharedBlob, aliceReaderBlob)
assert.deepEqual(alicesMessage, helloEveryone)
```

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

For client distributions (where the source code is uglified):

    npm run client-build
    cd /dist
    npm run publish

Note that the `package.json` is copied from the project root, so any version amendments should be made before publication.

TODO: Optimise publication process; ideally we will not have to manually publish a separate version for the client distribution.

## Testing

    npm test

or:

    npm i -g jest

    jest


### Browser Usage

Please require `dist/b-privacy.js`, that's the browser-ready version.

You also need to include `bitcore-lib` manually before that. See `test/browser.index.html` for a working example.


To make the example work you need to build bitcore-lib for the browser, run:

    cd node_modules/bitcore-lib
    npm i
    gulp browser

