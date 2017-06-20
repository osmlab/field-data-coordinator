'use strict'

const { List } = require('immutable')

const initialState = List()

module.exports = function (state = initialState, { type, surveys }) {
  switch (type) {
    case 'RECEIVE_SURVEY_LIST':
      return List(surveys)

    default:
      return state
  }
}
