const path = require('path')
const config = require('./package.json')

module.exports = {
  dir: path.join(__dirname, 'dist'),
  appName: config.productName,
  teamName: 'Development Seed and Digital Democracy',
  appFileName: 'observe-desktop',
  version: config.version,
  iconPath: path.join(__dirname, 'static/mapfilter'),
  out: 'release',
  electronVersion: '1.7.3'
}
