const { fullDate } = require('../format')

module.exports.excludedProperties = ['id', '_version_id']
module.exports.formatHeader = {
  _timestamp: 'Timestamp',
  _device_id: 'Device ID',
  _preset_id: 'Survey ID'
}
module.exports.formatRow = {
  _timestamp: fullDate
}
