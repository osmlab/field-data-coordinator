'use strict'
const path = require('path')
const level = require('level')
const through = require('through2')
const pump = require('pump')
const randomBytes = require('randombytes')
const osmdb = require('osm-p2p')
const osmobs = require('osm-p2p-observations')
const { get } = require('object-path')

module.exports = {
  start,
  createOsmReplicationStream,
  createObservation,
  listObservations
}

let osm, obs
function start (osmdir) {
  if (typeof osm === 'undefined' && typeof obs === 'undefined') {
    var obsdb = level(path.join(osmdir, 'obsdb'))
    osm = osmdb(osmdir)
    obs = osmobs({ db: obsdb, log: osm.log })
  }
}

function createOsmReplicationStream () {
  return osm.log.replicate()
}

function createObservation (feature, cb) {
  if (feature.type !== 'Feature') {
    return cb(new Error('Expected GeoJSON feature object'))
  } else if (typeof feature.properties === 'undefined') {
    // TODO check for a specific property or against a schema
    return cb(new Error('GeoJSON feature requires properties'))
  }
  var obs = {
    type: 'observation',
    tags: feature.properties,
    timestamp: new Date().toISOString()
  }
  if (feature.geometry && feature.geometry.coordinates) {
    obs.lon = feature.geometry.coordinates[0]
    obs.lat = feature.geometry.coordinates[1]
  }
  var id = feature.id || '' + randomBytes(8).toString('hex')
  osm.put(id, obs, cb)
}

function listObservations (cb) {
  var features = []
  pump(osm.kv.createReadStream(), through.obj(write), done)

  function write (row, enc, next) {
    var values = Object.keys(row.values || {})
    .map(v => row.values[v])
    if (values.length && get(values, '0.value.type') === 'observation') {
      var latest = values.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))[0]
      features.push(observationToFeature(latest.value, row.key))
    }
    next()
  }
  function done (err) {
    if (err) return cb(err)
    cb(null, features)
  }
}

function observationToFeature (obs, id) {
  var feature = {
    id,
    type: 'Feature',
    geometry: null,
    properties: obs.tags
  }
  if (obs.lon && obs.lat) {
    feature.geometry = {
      type: 'Point',
      coordinates: [ obs.lon, obs.lat ]
    }
  }
  return feature
}
