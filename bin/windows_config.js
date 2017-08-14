const config = require('../config')
module.exports = {
  dir: config.dir,
  arch: 'x64',
  asar: false,
  platform: 'win32',
  icon: config.iconPath + '.icns',
  out: config.out,
  tmpdir: false,
  version: config.electronVersion,
  'app-version': config.version,
  'build-version': config.version,
  prune: true,
  overwrite: true,
  'version-string': {
    ProductName: config.appName,
    CompanyName: config.teamName
  }
}
