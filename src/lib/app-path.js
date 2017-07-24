const mkdirp = require('mkdirp')
const path = require('path')
const { app } = require('electron')

const APP_DIR = 'org.osm-labs.field-data-coordinator'

module.exports = function () {
  var dir = path.join(app.getPath('userData'), APP_DIR)
  mkdirp.sync(dir)
  return dir
}

