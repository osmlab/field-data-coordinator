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
const once = require('once')

module.exports = {
  start,
  createOsmOrgReplicationStream,
  createObservationsReplicationStream,
  createObservation,
  listObservations,
  importBulkOsm,
  bboxQuerySavedOsm
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
    importer(osmOrgDbPath, request(queryUrl), function (err) {
      osmOrgDb = osmOrgDb || osmdb(osmOrgDbPath)
      if (err) {
        console.warn(err)
        cb(err)
      } else {
        // Deduplicate nodes that appear in the new OSM.org data *and* the observationsDb.
        deduplicatePlaceholderNodes(function (err) {
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

// Iterate over all documents, identify those that were placeholder nodes that
// now have a de-facto version in OSM.org, and remove the old placeholder.
function deduplicatePlaceholderNodes (cb) {
  var pending = 0
  cb = once(cb)

  // Iterate over *all* documents in the OSM.org data
  var q = osmOrgDb.queryStream([-90, 90, -180, 180])
  q.on('data', function (doc) {
    if (doc.type !== 'node') return
    if (!doc.tags) return
    if (!doc.tags['osm-p2p-id']) return

    // This document has an 'osm-p2p-id'; look it up in the observationsDb to see if it exists.
    observationsDb.get(doc.tags['osm-p2p-id'], function (err, docMap) {
      if (err) return cb(err)
      var docs = Object.keys(docMap).map(key => docMap[key])
      docs.forEach(function (obsDoc) {
        pending++
        processNode(doc, obsDoc, function (err) {
          if (--pending === 0 || err) cb(err)
        })
      })
    })
  })

  function processNode (osmOrgNode, obsNode, done) {
    // Skip deleted nodes
    if (obsNode.deleted) return

    done = once(done)

    // Delete the node, and update the observation-link to point to the OSM.org node's ID
    observationsDb.del(obsNode.id, function (err) {
      if (err) return done(err)
      observationsIndex.links(obsNode.id, function (err, links) {
        if (err) return done(err)
        var remaining = links.length
        links.forEach(function (link) {
          link.link = osmOrgNode.id
          observationsDb.put(link.id, link, function (err, _) {
            console.log('_', _)
            if (--remaining === 0) cb(err)
          })
        })
      })
    })
  }
}
