'use strict'
const { Map } = require('immutable')
const initialState = Map()
module.exports = function (state = initialState, { type, error }) {
  switch (type) {
    case 'OSM_QUERY_FAILED':
      return state.set('osmQuery', getErrorMessage(error))
    case 'OSM_QUERY_SUCCESS':
      return state.delete('osmQuery')
    default:
      return state
  }
}

function getErrorMessage (error) {
  if (error instanceof Error) {
    return error.message || error.name || error.toString()
  }
  return error
}
