#!/usr/bin/env sh

set -ex

node uglify.js
cp package.json ./dist
cd ./dist
sed -i 's/"name": "@appliedblockchain\/b-privacy",/"name": "@appliedblockchain\/b-privacy-client",/g' package.json
npm i