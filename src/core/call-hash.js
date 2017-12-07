const bufferToHex0x = require('./buffer-to-hex0x')
const toKeccak256 = require('./to-keccak256')
const bufferToKeccak256 = require('./buffer-to-keccak256')

/**
 * Calcualtes call hash for provided list of values. By convention the first value is the name of the function.
 *
 * @param {any[]} args [description]
 * @return {hex0x}
 */
function callHash(...args) {
  const join = (a, value, index) => {
    try {
      const b = toKeccak256(value)
      const c = bufferToKeccak256(Buffer.concat([ a, b ]))
      return c
    } catch (err) {
      err.message += ` (param at index ${index}).`
      throw err
    }
  }
  return bufferToHex0x(args.reduce(join, Buffer.alloc(32, 0)))
}

module.exports = callHash
