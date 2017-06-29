const config = require('../config')
module.exports = {
  dir: config.dir,
  arch: 'x64',
  asar: false,
  platform: 'darwin',
  icon: config.iconPath + '.icns',
  out: config.out,
  tmpdir: false,
  version: config.electronVersion,
  'app-version': config.version,
  'build-version': config.version,
  prune: true,
  overwrite: true,
  'app-bundle-id': 'osmlabs.observe.coordinator'
}
