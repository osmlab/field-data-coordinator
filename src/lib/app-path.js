const mkdirp = require('mkdirp')
const path = require('path')
const { app } = require('electron')

const APP_DIR = 'org.osm-labs.field-data-coordinator'

module.exports = function () {
  var dir = app.getPath('userData')

  // Development mode doesn't include the APP_DIR subdirectory, but production
  // does.
  if (dir.indexOf(APP_DIR) !== -1) {
    dir = path.join(dir, APP_DIR)
  }

  mkdirp.sync(dir)

  return dir
}
