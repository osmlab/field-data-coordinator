'use strict'

const remote = require('electron').remote
const promisify = require('es6-promisify')

const { db: { listObservations }, openImportSurveyDialog } = remote.require(
  './main'
)

// Use these drivers to interface with a local osm p2p instance.
// This should *in theory* make it easier to create a hosted version.

module.exports = {
  listObservations: promisify(listObservations),
  importSurvey: promisify(openImportSurveyDialog)
}
