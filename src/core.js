
const assert = require('assert');
const keccak = require('keccak');

function toChecksumAddress(address) {
  assert(isHex0x(address));
  const hex = address.slice(2).toLowerCase();
  const hash = keccak('keccak256').update(hex).digest('hex');
  return '0x' + hex
    .split('')
    .map((c, i) => parseInt(hash[i], 16) >= 8 ? c.toUpperCase() : c)
    .join('');
}

function bufferToKeccak256(buf) {
  assert(Buffer.isBuffer(buf), `Expected Buffer, got ${typeof buf}.`);
  return keccak('keccak256').update(buf).digest();
}

function hex0xToKeccak256(value) {
  assert(isHex0x(value));
  return bufferToHex0x(bufferToKeccak256(hex0xToBuffer(value)));
}

// Calcualtes keccak256 hash on hex0x or buffer `value`. Returns same type as input.
//
// @param value {hex0x|buffer} Input to hash.
// @return {hex0x|buffer} keccak256 of `value`.
function toKeccak256(value) {
  if (isHex0x(value)) {
    return hex0xToKeccak256(value);
  }
  if (isBuffer(value)) {
    return bufferToKeccak256(value);
  }
  throw new TypeError(`Unknown input ${kindOf(value)}, expected hex0x or buffer.`);
}

function bufferToHex0x(value) {
  assert(isBuffer(value));
  return '0x' + value.toString('hex');
}

function hex0xToBuffer(value) {
  assert(isHex0x(value));
  return Buffer.from(value.slice(2), 'hex');
}

// Returns string describing kind of type of `value`, ie. `null` or `promise`.
function kindOf(value) {
  if (typeof value !== 'object') {
    return typeof value;
  }
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  if (isPromise(value)) {
    return 'promise';
  }
  if (isBuffer(value)) {
    return 'buffer';
  }
  return `[other]`;
}

// Unsafe version of `kindOf`. For testing only. Should not be used in the code
// as it can leak sensitive information into thrown errors.
function unsafeKindOf(value) {
  return `${kindOf(value)} ${JSON.stringify(value)}`;
}

// Check if `value` is a string, returns `true` or `false`.
function isString(value) {
  return typeof value === 'string';
}

// Check if `value` is a `Buffer`, returns `true` or `false`.
function isBuffer(value) {
  return Buffer.isBuffer(value);
}

// Asserts that the `value` is a `Buffer`. Throws an error with `message` if
// it's not.
function assertBuffer(value, message) {
  if (!isBuffer(value)) {
    const defaultMessage = `Expected Buffer, got ${typeof value}.`;
    throw new TypeError(message || defaultMessage);
  }
}

const HexRegExp = /^([0-9a-f]{2})+$/i;

// Check if `value` is hex string, returns `true` or `false`.
function isHex(value) {
  return isString(value) && value.length % 2 === 0 && HexRegExp.test(value);
}

// Check if `value` is 0x-prefixed hex string, returns `true` or `false`.
function isHex0x(value) {
  return isString(value) && value.startsWith('0x') && isHex(value.slice(2));
}

// Check if `value` looks like `Promise/A+`, returns `true` or `false`.
function isPromise(value) {
  return value !== null && typeof value === 'object' && typeof value.then === 'function';
}

// Check if `buffer` and `otherBuffer` are equal, returns `true` or `false`.
function areBuffersEqual(buffer, otherBuffer) {
  assertBuffer(buffer);
  assertBuffer(otherBuffer);
  return buffer.equals(otherBuffer);
}

// Convert `Buffer` or hex `value` to 0x-prefixed hex string. Throw `TypeError`
// if input is not supported. If value is 0x-prefixed hex string, returns
// `value`.
function toHex0x(value) {
  if (isHex0x(value)) {
    return value;
  }
  if (isBuffer(value)) {
    return '0x' + value.toString('hex');
  }
  if (isHex(value)) {
    return '0x' + value;
  }
  if (isPromise(value)) {
    throw new TypeError(`Expected Buffer, got Promise.`);
  }
  throw new TypeError(`Expected (Buffer | Hex | Hex0x), got ${typeof value}.`);
}

function toBuffer(value) {
  if (isBuffer(value)) {
    return value;
  }
  if (isHex0x(value)) {
    return Buffer.from(value.slice(2), 'hex');
  }
  if (isHex(value)) {
    return Buffer.from(value, 'hex');
  }
  throw new TypeError(`Unknown value type ${kindOf(value)}.`);
}

module.exports = {
  toChecksumAddress,
  bufferToKeccak256,
  hex0xToKeccak256,
  toKeccak256,
  bufferToHex0x,
  hex0xToBuffer,
  isBuffer,
  isString,
  isHex,
  isHex0x,
  toBuffer,
  //toHex,
  toHex0x,
  areBuffersEqual,
  kindOf,
  unsafeKindOf
};
