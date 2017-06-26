'use strict'
const url = require('url')
const path = require('path')
const level = require('level')
const through = require('through2')
const pump = require('pump')
const randomBytes = require('randombytes')
const osmdb = require('osm-p2p')
const osmobs = require('osm-p2p-observations')
const importer = require('osm-p2p-db-importer')
const { get } = require('object-path')
const request = require('request')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { osmapi } = require('../config')

module.exports = {
  start,
  createOsmOrgReplicationStream,
  createObservationsReplicationStream,
  createObservation,
  listObservations,
  importBulkOsm
}

let osmOrgDb
let osmOrgDbPath
let observationsDb
let observationsIndex

function start (rootDir) {
  if (typeof osmOrgDb === 'undefined' && typeof observationsDb === 'undefined' && typeof observationsIndex === 'undefined') {
    osmOrgDbPath = path.join(rootDir, 'osmOrgDb')
    osmOrgDb = osmdb(osmOrgDbPath)
    observationsDb = osmdb(path.join(rootDir, 'observationsDb'))
    var obsdb = level(path.join(rootDir, 'observationsIndex'))
    observationsIndex = osmobs({ db: obsdb, log: observationsDb.log })
  }
}

function createOsmOrgReplicationStream () {
  return osmOrgDb.log.replicate()
}

function createObservationsReplicationStream () {
  return observationsDb.log.replicate()
}

function wipeDb (db, path, cb) {
  db.close(() => rimraf(path, () => mkdirp(path, cb)))
}

function importBulkOsm (bbox, cb) {
  const queryUrl = url.resolve(osmapi, `map?bbox=${bbox}`)
  const importFn = () => {
    importer(osmOrgDbPath, request(queryUrl), function (err) {
      osmOrgDb = osmOrgDb || osmdb(osmOrgDbPath)
      if (err) cb(err)
      else cb(null, `Finished importing ${bbox}`)
    })
  }
  if (osmOrgDb) {
    wipeDb(osmOrgDb.db, osmOrgDbPath, () => {
      osmOrgDb = null
      importFn()
    })
  } else {
    importFn()
  }
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
  observationsDb.put(id, obs, cb)
}

function listObservations (cb) {
  var features = []

  observationsDb.ready(function () {
    pump(observationsDb.kv.createReadStream(), through.obj(write), done)
  })

  function write (row, enc, next) {
    var values = Object.keys(row.values || {}).map(v => row.values[v])
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
    properties: Object.assign({ id }, obs.tags)
  }
  if (obs.lon && obs.lat) {
    feature.geometry = {
      type: 'Point',
      coordinates: [ obs.lon, obs.lat ]
    }
  }
  return feature
}
