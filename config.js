const path = require('path')
const config = require('./package.json')

module.exports = {
  dir: path.join(__dirname, 'src'),
  osmapi: 'http://api.openstreetmap.org/api/0.6/',
  appName: config.productName,
  appFileName: 'observe-desktop',
  version: config.version,
  iconPath: path.join(__dirname, 'static/mapfilter'),
  out: 'release',
  electronVersion: '1.7.3'
}
