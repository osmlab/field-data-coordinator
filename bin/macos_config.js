const config = require('../config')
module.exports = {
  dir: './',
  arch: 'x64',
  platform: 'darwin',
  icon: config.iconPath + '.icns',
  out: config.out,
  tmpdir: false,
  ignore: [/bin/],
  version: config.electronVersion,
  'app-version': config.version,
  'build-version': config.version,
  prune: true,
  overwrite: true,
  'app-bundle-id': 'osmlabs.observe.coordinator'
}
