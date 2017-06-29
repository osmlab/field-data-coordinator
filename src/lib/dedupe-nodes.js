const once = require('once')

module.exports = deduplicatePlaceholderNodes

// Iterate over all documents, identify those that were placeholder nodes that
// now have a de-facto version in OSM.org, and remove the old placeholder.
function deduplicatePlaceholderNodes (observationsDb, osmOrgDb, observationsIndex, cb) {
  var pending = 0
  cb = once(cb)

  // Iterate over *all* documents in the OSM.org data
  var q = osmOrgDb.queryStream([[-90, 90], [-180, 180]])
  q.on('data', function (doc) {
    pending++
    if (doc.type !== 'node' || !doc.tags || !doc.tags['osm-p2p-id']) {
      return process.nextTick(function () {
        if (--pending === 0) return cb()
      })
    }

    // This document has an 'osm-p2p-id'; look it up in the observationsDb to see if it exists.
    observationsDb.get(doc.tags['osm-p2p-id'], function (err, docMap) {
      if (err) return cb(err)
      var docs = Object.keys(docMap).map(key => docMap[key])
      docs.forEach(function (obsDoc) {
        pending++
        obsDoc.id = doc.tags['osm-p2p-id']
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
          var id = link.key
          link = link.value
          link.link = osmOrgNode.id
          observationsDb.put(id, link, function (err, _) {
            if (--remaining === 0) cb(err)
          })
        })
      })
    })
  }
}
