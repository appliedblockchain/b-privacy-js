'use strict'

const assert = require('assert')
const B = require('..')
const bufferToHex0x = require('../src/core/buffer-to-hex0x')
const bytesToBuffer = require('../src/core/bytes-to-buffer')
const elliptic = require('elliptic')
const encryptSymmetric = require('../src/core/encrypt-symmetric')
const decryptSymmetric = require('../src/core/decrypt-symmetric')
const ec = elliptic.ec('secp256k1')

B.prototype.deriveSecret = function (publicKey) {
  const a = bytesToBuffer(this.privateKey)
  const b = bytesToBuffer(publicKey)
  const x = b.slice(0, 32)
  const y = b.slice(32, 64)
  return ec.keyFromPrivate(a).derive(ec.keyFromPublic({ x, y }).getPublic()).toArrayLike(Buffer, 'be', 32)
}

B.prototype.encryptAnonymousMessage = function (msg, publicKey) {
  assert(typeof msg !== 'undefined')
  const t = new B()
  const secret = t.deriveSecret(publicKey)
  const id = bufferToHex0x(t.publicKey)
  const smsg = bufferToHex0x(encryptSymmetric(msg, secret))
  return { id, smsg }
}

B.prototype.decryptAnonymousMessage = function ({ id, smsg }) {
  const secret = this.deriveSecret(id)
  try {
    return decryptSymmetric(smsg, secret)
  } catch (err) {
    return
  }
}

const alice = new B()
const bob = new B()
const clark = new B()

const m = alice.encryptAnonymousMessage({ hello: 'world' }, bob.publicKey)
console.log('secret anonymous message to somebody', m)
console.log({ bob: bob.decryptAnonymousMessage(m) }) // it's for bob, he can decrypt it/see it.
console.log({ clark: clark.decryptAnonymousMessage(m) }) // undefined - can't decrypt/not allowed to see.

// nobody can say who created the message
// nobody can say who can decrypt it, except bob - for whom the message was created, bob can decrypt it.