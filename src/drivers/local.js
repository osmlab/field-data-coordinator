'use strict'
const remote = require('electron').remote
const { listObservations } = remote.require('./main').db
const promisify = require('es6-promisify')

// Use these drivers to interface with a local osm p2p instance.
// This should *in theory* make it easier to create a hosted version.

module.exports = {
  listObservations: promisify(listObservations)
}
