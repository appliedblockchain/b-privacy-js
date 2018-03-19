'use strict'

const assert = require('assert')
const B = require('..')

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