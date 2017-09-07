const mkdirp = require('mkdirp')
const path = require('path')
const { app } = require('electron')
const config = require('../package.json')
const APP_DIR = config.name
process.stdout.write(APP_DIR + '\n')

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
