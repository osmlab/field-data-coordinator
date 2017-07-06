'use strict'
const path = require('path')
const level = require('level')
const through = require('through2')
const pump = require('pump')
const randomBytes = require('randombytes')
const osmdb = require('osm-p2p')
const osmobs = require('osm-p2p-observations')
const osmTimestampIndex = require('osm-p2p-timestamp-index')
const importer = require('osm-p2p-db-importer')
const osmGeojsonStream = require('osm-p2p-geojson')
const { get } = require('object-path')
const rimraf = require('rimraf')
const mkdirp = require('mkdirp')
const deduplicatePlaceholderNodes = require('./dedupe-nodes')
const getOsmStream = require('./get-osm-stream')
const fs = require('fs')

module.exports = {
  start,
  createOsmOrgReplicationStream,
  createObservationsReplicationStream,
  getObservationTimestampStream,
  createObservation,
  listObservations,
  importBulkOsm,
  bboxQuerySavedOsm,
  getLocalOsmOrgXmlStream
}

let osmOrgDb
let osmOrgDbPath
let observationsDb
let observationsIndex
let observationsTimestampIndex
let dbRootDir

function start (rootDir) {
  dbRootDir = rootDir
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

function getObservationTimestampStream (options, cb) {
  var done, opts
  if (typeof cb === 'undefined') {
    done = options
    opts = {}
  } else {
    done = cb
    opts = options
  }
  observationsTimestampIndex.ready(() => done(null, observationsTimestampIndex.getDocumentStream(opts)))
}

function wipeDb (db, path, cb) {
  db.close(err => {
    if (err) return cb(err)
    else osmOrgDb = null
    rimraf(path, err => {
      if (err) return cb(err)
      mkdirp(path, cb)
    })
  })
}

function getLocalOsmOrgXmlStream () {
  let xmlFilePath = path.join(dbRootDir, 'current.xml')
  if (!fs.existsSync(xmlFilePath)) {
    return null
  }
  return fs.createReadStream(xmlFilePath)
}

/* Perform an http query to osm.org using the bounding box endpoint.
 * With the response stream, bulk import into the local osm-p2p db,
 * closing and wiping the db beforehand and re-upping it afterwards.
 */
function importBulkOsm (bbox, cb) {
  wipeDb(osmOrgDb.db, osmOrgDbPath, (err) => {
    if (err) {
      done(err)
    } else {
      getOsmStream(bbox, function (err, stream) {
        if (err) return done(err)

        // Write local OSM.org XML data to disk
        let xmlFilePath = path.join(dbRootDir, 'current.xml')
        stream.pipe(fs.createWriteStream(xmlFilePath))

        importer(osmOrgDbPath, stream, function (err) {
          if (err) {
            done(err)
          } else {
            // up the DB before deduping nodes
            osmOrgDb = osmOrgDb || osmdb(osmOrgDbPath)
            // Deduplicate nodes that appear in the new OSM.org data *and* the observationsDb.
            deduplicatePlaceholderNodes(observationsDb, osmOrgDb, observationsIndex, function (err) {
              done(err, `Finished importing ${bbox}`)
            })
          }
        })
      })
    }
  })

  function done (err, message) {
    osmOrgDb = osmOrgDb || osmdb(osmOrgDbPath)
    if (err) console.warn(err)
    cb(err, message)
  }
}

function bboxQuerySavedOsm (query, cb) {
  osmOrgDb.query(query, (err, docs) => {
    if (err) cb(err)
    osmGeojsonStream(osmOrgDb, { docs, objectMode: true }, function (err, geojson) {
      if (err) cb(err)
      cb(null, geojson)
    })
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
