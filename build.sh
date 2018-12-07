#!/usr/bin/env sh

set -ex

node uglify.js
cp package.json ./dist
cd ./dist
sed -i '-backup' 's/"name": "@appliedblockchain\/b-privacy",/"name": "@appliedblockchain\/b-privacy-client",/g' package.json
rm package.json-backup