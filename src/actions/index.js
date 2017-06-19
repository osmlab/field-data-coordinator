'use strict'

module.exports.importSurvey = () => ({
  type: 'IMPORT_SURVEY'
})

module.exports.sync = () => ({ type: 'SYNC' })

module.exports.toggleFilterProperty = property => ({
  type: 'TOGGLE_FILTER_PROPERTY',
  property
})

module.exports.clearFilterProperties = () => ({ type: 'CLEAR_FILTER_PROPERTIES' })

module.exports.setActiveObservation = (observationId) => ({
  type: 'SET_ACTIVE_OBSERVATION',
  observationId
})

module.exports.updateSurveyList = surveys => {
  return {
    type: 'RECEIVE_SURVEY_LIST',
    surveys
  }
}
