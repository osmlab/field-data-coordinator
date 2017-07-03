'use strict'
const url = require('url')
const path = require('path')
const level = require('level')
const through = require('through2')
const pump = require('pump')
const randomBytes = require('randombytes')
const osmdb = require('osm-p2p')
const osmobs = require('osm-p2p-observations')
const osmTimestampIndex = require('osm-p2p-timestamp-index')
const importer = require('osm-p2p-db-importer')
const { get } = require('object-path')
const request = require('request')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const { osmapi } = require('../config')
const deduplicatePlaceholderNodes = require('./dedupe-nodes')

module.exports = {
  start,
  createOsmOrgReplicationStream,
  createObservationsReplicationStream,
  getObservationTimestampStream,
  createObservation,
  listObservations,
  importBulkOsm,
  bboxQuerySavedOsm
}

let osmOrgDb
let osmOrgDbPath
let observationsDb
let observationsIndex
let observationsTimestampIndex

function start (rootDir) {
  if (typeof osmOrgDb === 'undefined' && typeof observationsDb === 'undefined' && typeof observationsIndex === 'undefined') {
    osmOrgDbPath = path.join(rootDir, 'osmOrgDb')
    osmOrgDb = osmdb(osmOrgDbPath)
    observationsDb = osmdb(path.join(rootDir, 'observationsDb'))
    var obsdb = level(path.join(rootDir, 'observationsIndex'))
    observationsIndex = osmobs({ db: obsdb, log: observationsDb.log })
    observationsTimestampIndex = osmTimestampIndex(observationsDb)
  }
}

function createOsmOrgReplicationStream () {
  return osmOrgDb.log.replicate()
}

function createObservationsReplicationStream () {
  return observationsDb.log.replicate()
}

function getObservationTimestampStream (options) {
  const opts = options || {}
  return observationsTimestampIndex.getDocumentStream(opts)
}

function wipeDb (db, path, cb) {
  db.close(err => {
    if (err) return cb(err)
    rimraf(path, err => {
      if (err) return cb(err)
      mkdirp(path, cb)
    })
  })
}

/* Perform an http query to osm.org using the bounding box endpoint.
 * With the response stream, bulk import into the local osm-p2p db,
 * closing and wiping the db beforehand and re-upping it afterwards.
 */
function importBulkOsm (bbox, cb) {
  const queryUrl = url.resolve(osmapi, `map?bbox=${bbox}`)
  const importFn = () => {
    /* osm.org doesn't set an error code when the request contains too many nodes.
     * Instead it returns a message in the body. Use a pass-through stream
     * to check the first line of a response to determine if this occurred.
     */
    let first = true
    const requestStream = request.get(queryUrl).on('error', cb)
    .pipe(through(function (chunk, enc, next) {
      if (first) {
        first = false
        const message = chunk.toString()
        if (message.indexOf('You requested too many nodes') >= 0) {
          next(message)
        } else next(null, chunk)
      } next(null, chunk)
    })).on('error', cb)

    importer(osmOrgDbPath, requestStream, function (err) {
      osmOrgDb = osmOrgDb || osmdb(osmOrgDbPath)
      if (err) {
        console.warn(err)
        cb(err)
      } else {
        // Deduplicate nodes that appear in the new OSM.org data *and* the observationsDb.
        deduplicatePlaceholderNodes(observationsDb, osmOrgDb, observationsIndex, function (err) {
          cb(err, `Finished importing ${bbox}`)
        })
      }
    })
  }

  if (!osmOrgDb) importFn()
  else {
    wipeDb(osmOrgDb.db, osmOrgDbPath, (err) => {
      if (err) {
        console.warn(err)
        cb(err)
      } else {
        osmOrgDb = null
        importFn()
      }
    })
  }
}

function bboxQuerySavedOsm (query, cb) {
  osmOrgDb.query(query, (err, results) => {
    if (err) cb(err)
    cb(null, results)
  })
}

function createObservation (feature, nodeId, cb) {
  if (!nodeId) {
    return cb(new Error('Expected nodeId to be set'))
  } else if (feature.type !== 'Feature') {
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
  // TODO(noffle): using a non-integer ID may cause trouble down the line!
  var id = feature.id || '' + randomBytes(8).toString('hex')
  observationsDb.put(id, obs, function (err) {
    if (err) return cb(err)
    var link = {
      type: 'observation-link',
      obs: id,
      link: nodeId
    }
    observationsDb.create(link, cb)
  })
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
