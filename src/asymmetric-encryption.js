
const assert = require('assert');
const crypto = require('crypto');
const { toBuffer } = require('./core');

// TODO: Remove, use `crypto.pbkdf2` or something else.
function kdf(keyMaterial, keyLength) {
  const blockSize = 64;
  const reps = ((keyLength + 7) * 8) / (blockSize * 8);
  const buffers = [];
  for (let counter = 0, tmp = Buffer.allocUnsafe(4); counter <= reps;) {
    counter += 1;
    tmp.writeUInt32BE(counter);
    buffers.push(crypto.createHash('sha256').update(tmp).update(keyMaterial).digest());
  }
  return Buffer.concat(buffers).slice(0, keyLength);
}

// Encrypts `input` JSON message using `privateKey` and remote `publicKey`.
function encrypt(input, { privateKey: inputPrivateKey, publicKey: inputPublicKey }) {

  const data = Buffer.from(JSON.stringify(input), 'utf8');

  // We'll work on buffer for private key.
  const privateKey = toBuffer(inputPrivateKey);

  // We'll work on buffer for remote public key.
  const publicKey = toBuffer(inputPublicKey);

  const dh = new crypto.createECDH('secp256k1');
  dh.setPrivateKey(privateKey);
  const secret = dh.computeSecret(toBuffer(publicKey));

  const key = kdf(secret, 32);
  const ekey = key.slice(0, 16);
  const mkey = crypto.createHash('sha256')
    .update(key.slice(16, 32))
    .digest();

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-128-ctr', ekey, iv);
  const encryptedData = cipher.update(data);
  const ivData = Buffer.concat([ iv, encryptedData ]);

  const tag = crypto.createHmac('sha256', mkey)
    .update(ivData)
    .digest();

  return Buffer.concat([ dh.getPublicKey(), ivData, tag ]);
}

function decrypt(data, { privateKey }) {
  const publicKey = data.slice(0, 65);

  const ivData = data.slice(65, -32);
  const tag = data.slice(-32);

  // derive keys
  const dh = new crypto.createECDH('secp256k1');
  dh.setPrivateKey(privateKey);
  const x = dh.computeSecret(publicKey);

  const key = kdf(x, 32);
  const ekey = key.slice(0, 16);
  const mkey = crypto.createHash('sha256').update(key.slice(16, 32)).digest();

  const tag2 = crypto.createHmac('sha256', mkey).update(ivData).digest();
  assert(tag2.equals(tag), 'Tag mismatch.');

  const iv = ivData.slice(0, 16);
  const encryptedData = ivData.slice(16);
  const decipher = crypto.createDecipheriv('aes-128-ctr', ekey, iv);
  const decrypted = decipher.update(encryptedData);
  return JSON.parse(decrypted.toString('utf8'));
}

module.exports = {
  encrypt,
  decrypt
};
