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

const possibleKeys = []
const possibleKeysCount = 2 + Math.floor(Math.random() * 3)
for (let i = 0; i < possibleKeysCount; ++i, possibleKeys.push(randomWords())) {}

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
  possibleKeys.forEach((key) => {
    payload.properties[key] = randomWords()
  })
  payload.properties._device_id = 'foo'
  payload.properties._preset_id = 'bar'
  payload.properties._timestamp = new Date().getTime()
  fs.writeFileSync(path.join(destination, `${i}.json`), JSON.stringify(payload))
}
