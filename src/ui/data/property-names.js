const { fullDate } = require('../format')

module.exports.excludedProperties = [
  '_version_id',
  'osm-p2p-id',
  'id'
]
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
  ['Username', 'userName'],
  ['Device ID', 'deviceId'],
  ['Survey ID', 'surveyId'],
  ['Observation Type', 'surveyType'],
  ['Date Submitted', '_timestamp']
]

module.exports.tableRows = [
  'userName',
  'deviceId',
  'surveyId',
  'surveyType',
  (d) => fullDate(d._timestamp)
]

module.exports.filterItems = [
  ['Username', 'userName'],
  ['Device ID', 'deviceId'],
  ['Survey ID', 'surveyId'],
  ['Observation Type', 'surveyType']
]
