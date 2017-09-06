const { fullDate } = require('../format')

module.exports.excludedProperties = ['id', '_version_id']
module.exports.formatHeader = {
  _timestamp: 'Timestamp',
  deviceId: 'Device ID',
  surveyId: 'Survey ID',
  surveyType: 'Survey Type'
}
module.exports.formatRow = {
  _timestamp: fullDate
}

module.exports.accessors = {
  device: 'deviceId',
  survey: 'surveyId',
  surveyType: 'surveyType',
  observationId: 'id',
  version: '_version_id',
  p2pId: 'osm-p2p-id',
  timestamp: '_timestamp'
}
