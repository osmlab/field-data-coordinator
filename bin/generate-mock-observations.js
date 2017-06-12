#!/usr/bin/env node
'use strict'

/* generate a bunch of random geojson observations */

const fs = require('fs')
const randomCoords = require('random-coordinates')
const randomWords = require('random-words')

const mkdirp = require('mkdirp')
const path = require('path')
const destination = path.join(__dirname, 'observations')
mkdirp(destination)

const minimist = require('minimist')
const argv = minimist(process.argv.slice(2))
const count = Array.isArray(argv._) ? argv._[0] : 50

for (let i = 0; i < count; ++i) {
  const coordinates = randomCoords().split(', ')
  const payload = {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [coordinates[1], coordinates[0]]
    },
    properties: {}
  }
  for (let k = 0; k < 3; ++k) {
    payload.properties[randomWords()] = randomWords()
  }
  fs.writeFileSync(path.join(destination, `${i}.json`), JSON.stringify(payload))
}
