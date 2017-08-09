'use strict'

const { List } = require('immutable')

const initialState = List()

module.exports = function (state = initialState, { type, surveys, id }) {
  switch (type) {
    case 'RECEIVE_SURVEY_LIST':
      return List(surveys)
    case 'REMOVE_SURVEY_SUCCESS':
      return state.filter(d => d.id !== id)
    default:
      return state
  }
}
