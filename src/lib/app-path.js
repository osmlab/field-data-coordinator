const mkdirp = require('mkdirp')
const path = require('path')
const fs = require('fs')
const { app } = require('electron')

const APP_DIR = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8')).name

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
