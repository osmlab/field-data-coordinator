'use strict'
const fs = require('fs')
const createPoint = require('turf-point')
const createFeatureCollection = require('turf-featurecollection')
const json2csv = require('json2csv')
const shpwrite = require('shp-write')
const flat = require('flat')
const { exportObservations } = require('./db')

const getObservationsAsGeojson = (observationIds, cb) => {
  exportObservations.objects(observationIds, {linkedNodes: true}, (err, data) => {
    if (err) cb(err)
    else {
      const features = data.map(d => {
        const point = createPoint([d.lon, d.lat], d.tags)
        point.id = d.id
        point.version = d.version
        return point
      })
      cb(null, createFeatureCollection(features))
    }
  })
}

const writeFn = (filename) => {
  return (err, data) => {
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
  getObservationsAsGeojson(observationIds, writeFn(filename))
}

module.exports.csv = (observationIds, filename) => {
  if (!filename) return
  exportObservations.objects(observationIds, {linkedNodes: true}, (err, data) => {
    if (err) console.warn(err)
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
      } catch (err) {
        return console.warn(err)
      }
      console.log(csvString)
      writeFn(filename)(null, csvString)
    }
  })
}

module.exports.shp = (observationIds, filename) => {
  if (!filename) return
  if (filename.substr(filename.length - 4) !== '.zip') {
    filename += '.zip'
  }
  getObservationsAsGeojson(observationIds, (err, geojson) => {
    if (err) console.warn(err)
    else {
      const shpArrayBuffer = shpwrite.zip(geojson)
      fs.writeFileSync(filename, Buffer.from(shpArrayBuffer), {
        encoding: 'binary'
      })
    }
  })
}
