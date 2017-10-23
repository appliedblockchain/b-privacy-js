# B Privacy (JS)

(Name subject to change)

Blockchain Privacy JS library

Provides an easy way to interact with keys and sign messages (note: storage fo keys should be handled outside this library)

### Development

    npm run dev

### Build

Package the library for release (browser/node)

    npm run build

### Test

    npm run test

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
bp.pvtKey.toString(); // bp.pvtKey.toString();
signed_message = bp.sign("abc") // {r: Uint8Array(32), s: Uint8Array(32), v: 27}
```