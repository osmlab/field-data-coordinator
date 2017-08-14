const config = require('../config')
module.exports = {
  dir: config.dir,
  arch: 'x64',
  asar: false,
  platform: 'darwin',
  icon: config.iconPath + '.icns',
  out: config.out,
  tmpdir: false,
  electronVersion: config.electronVersion,
  appVersion: config.version,
  buildVersion: config.version,
  prune: true,
  overwrite: true,
  appBundleId: 'osmlabs.observe.coordinator'
}
