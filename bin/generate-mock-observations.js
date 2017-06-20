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
const possibleValues = []
const possibleCount = 2 + Math.floor(Math.random() * 3)
for (let i = 0; i < possibleCount; ++i, possibleKeys.push(randomWords()), possibleValues.push(randomWords())) {}

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
    payload.properties[key] = possibleValues[Math.floor(Math.random() * possibleCount)]
  })
  payload.properties._device_id = 'foo'
  payload.properties._preset_id = 'bar'
  payload.properties._timestamp = new Date().getTime()
  fs.writeFileSync(path.join(destination, `${i}.json`), JSON.stringify(payload))
}
