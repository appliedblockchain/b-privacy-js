# B Privacy (JS)

(Name subject to change)

Blockchain Privacy JS library

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
