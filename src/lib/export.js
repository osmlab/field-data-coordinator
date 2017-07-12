'use strict'
const fs = require('fs')
const createPoint = require('turf-point')
const createFeatureCollection = require('turf-featurecollection')
const json2csv = require('json2csv')
const flat = require('flat')
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

module.exports.csv = (observationIds, filename) => {
  if (!filename) return
  exportObservations.objects(observationIds, {linkedNodes: true}, function (err, data) {
    if (err) console.warn('error')
    else {
      const fields = {}
      const flattenedRows = []
      data.forEach(d => {
        const flattened = flat(d)
        flattenedRows.push(flattened)
        for (let field in flattened) { fields[field] = true }
      })
      try {
        var csvString = json2csv({ data: flattenedRows, fields: Object.keys(fields) })
      } catch (e) {
        return console.warn(e)
      }
      console.log(csvString)
      writeFn(filename)(null, csvString)
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
