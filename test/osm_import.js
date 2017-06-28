var test = require('tape')
var series = require('run-series')
var osmdb = require('osm-p2p-mem')
var obsdb = require('osm-p2p-observations')
var memdb = require('memdb')
var dedupe = require('../lib/dedupe-nodes')

test('OSM.org import with deduplication of a node in both DBs', function (t) {
  // Set up a new test db
  var observationsDb = osmdb()
  var osmOrgDb = osmdb()
  var observationsIndex = obsdb({ db: memdb(), log: observationsDb.log })

  var p2pId = '1024'
  var osmId
  var obsId

  var doc = {
    type: 'node',
    lon: 10,
    lat: -10,
    tags: {
      'osm-p2p-id': p2pId
    }
  }
  var obs = {
    type: 'observation',
    lon: 5,
    lat: -5
  }

  series([
    // Write a node to observationsDb _and_ osmOrgDb
    createNodes,
    // Write an observation + observation-link for that node
    createObservation,
    // Attempt deduplication
    deduplicatePlaceholderNodes,
    // Check that the node no longer exists
    checkNodes,
    // Check that the link points to the OSM.org node
    checkLink
  ], function (err) {
    t.error(err)
    t.end()
  })

  function createNodes (done) {
    osmOrgDb.create(doc, function (err, _osmId) {
      if (err) return done(err)
      osmId = _osmId
      observationsDb.put(p2pId, doc, done)
    })
  }

  function createObservation (done) {
    observationsDb.create(obs, function (err, _obsId) {
      if (err) return done(err)
      obsId = _obsId
      var link = {
        type: 'observation-link',
        obs: obsId,
        link: p2pId
      }
      observationsDb.create(link, done)
    })
  }

  function deduplicatePlaceholderNodes (done) {
    dedupe(observationsDb, osmOrgDb, observationsIndex, done)
  }

  function checkNodes (done) {
    observationsDb.get(p2pId, function (err, docs) {
      if (err) return done(err)
      docs = values(docs)
      t.equal(docs.length, 1)
      t.equal(docs[0].deleted, true)
      done()
    })
  }

  function checkLink (done) {
    observationsIndex.links(osmId, function (err, links) {
      if (err) return done(err)
      t.equal(links.length, 1)
      var expected = {
        type: 'observation-link',
        obs: obsId,
        link: osmId
      }
      t.deepEqual(links[0].value, expected)
      done()
    })
  }
})

function values (obj) { return Object.keys(obj).map(key => obj[key]) }
