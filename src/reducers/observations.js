'use strict'
const { List, fromJS } = require('immutable')
const initialState = List()

module.exports = function (state = initialState, action) {
  switch (action.type) {
    case 'SYNC_SUCCESS':
      return fromJS(action.observations)
    default:
      return state
  }
}
