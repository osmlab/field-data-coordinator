const path = require('path')
const config = require('./package.json')

module.exports = {
  osmapi: 'http://api.openstreetmap.org/api/0.6/',
  appName: 'Observe',
  appFileName: 'observe-desktop',
  version: config.version,
  iconPath: path.join(__dirname, 'static'),
  out: 'release',
  electronVersion: '1.7.3'
}
