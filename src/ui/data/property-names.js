const { fullDate } = require('../format')

module.exports.excludedProperties = ['id', '_version_id']

module.exports.accessors = {
  device: 'deviceId',
  survey: 'surveyId',
  surveyType: 'surveyType',
  observationId: 'id',
  version: '_version_id',
  p2pId: 'osm-p2p-id',
  timestamp: '_timestamp'
}

module.exports.tableHeaders = [
  'Username',
  'Device ID',
  'Survey ID',
  'Observation Type',
  'Date Submitted'
]

module.exports.tableRows = [
  'userName',
  'deviceId',
  'surveyId',
  'surveyType',
  (d) => fullDate(d._timestamp)
]
