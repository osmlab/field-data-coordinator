'use strict'
const fs = require('fs')
const createPoint = require('turf-point')
const createFeatureCollection = require('turf-featurecollection')
const { exportObservations } = require('./db')

// Canceling the dialog calls the function with a falsy filename.
module.exports.xml = (observationIds, filename) => {
  if (!filename) return
  exportObservations.changeXml(observationIds, writeFn(filename))
}

module.exports.json = (observationIds, filename) => {
  if (!filename) return
  exportObservations.change(observationIds, writeFn(filename))
}

module.exports.geojson = (observationIds, filename) => {
  if (!filename) return
  const write = writeFn(filename)
  exportObservations.objects(observationIds, {linkedNodes: true}, function (err, data) {
    if (err) console.warn('error')
    else {
      const features = data.map(d => {
        const point = createPoint([d.lon, d.lat], d.tags)
        point.id = d.id
        point.version = d.version
        return point
      })
      write(null, createFeatureCollection(features))
    }
  })
}

function writeFn (filename) {
  return function (err, data) {
    if (err) console.warn(err)
    else {
      console.log('Writing', filename)
      const stream = fs.createWriteStream(filename)
      const out = typeof data === 'string' ? data : JSON.stringify(data)
      stream.write(out)
      stream.end()
    }
  }
}
