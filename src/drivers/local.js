'use strict'
const { remote } = window.require('electron')
const promisify = require('es6-promisify')

const {
  db: {
    listObservations,
    listSequentialObservations,
    importBulkOsm,
    bboxQuerySavedOsm
  },
  openImportSurveyDialog,
  openExportXmlDialog,
  openExportJsonDialog,
  openExportGeojsonDialog,
  openExportCsvDialog,
  openExportShapefileDialog
} = remote.require('./main')

const { removeSurvey } = remote.require('./lib/surveys')

// Use these drivers to interface with a local osm p2p instance.
// This should *in theory* make it easier to create a hosted version.

module.exports = {
  listObservations: promisify(listObservations),
  listSequentialObservations: promisify(listSequentialObservations),
  importSurvey: promisify(openImportSurveyDialog),
  removeSurvey: promisify(removeSurvey),
  importOsm: promisify(importBulkOsm),
  querySavedOsm: promisify(bboxQuerySavedOsm),

  // these methods never make it into sagas, so no need to promisify
  exportXml: openExportXmlDialog,
  exportJson: openExportJsonDialog,
  exportGeojson: openExportGeojsonDialog,
  exportCsv: openExportCsvDialog,
  exportShp: openExportShapefileDialog
}
