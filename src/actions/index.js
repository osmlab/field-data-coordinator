'use strict'

module.exports.importSurvey = () => ({
  type: 'IMPORT_SURVEY'
})

module.exports.updateSurveyList = surveys => {
  return {
    type: 'RECEIVE_SURVEY_LIST',
    surveys
  }
}
module.exports.removeSurvey = id => ({ type: 'REMOVE_SURVEY', id })

module.exports.sync = () => ({ type: 'SYNC' })
module.exports.getOsm = (bounds) => ({ type: 'GET_OSM', bounds })

module.exports.toggleFilterProperty = property => ({
  type: 'TOGGLE_FILTER_PROPERTY',
  property
})

module.exports.setObservationTimeRange = range => ({
  type: 'SET_OBSERVATION_TIME_RANGE',
  range
})

module.exports.clearFilterProperties = () => ({ type: 'CLEAR_FILTER_PROPERTIES' })

module.exports.setActiveObservation = (observationId) => ({
  type: 'SET_ACTIVE_OBSERVATION',
  observationId
})
