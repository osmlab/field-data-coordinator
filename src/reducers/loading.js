'use strict'
const initialState = false
module.exports = function (state = initialState, { type }) {
  switch (type) {
    case 'OSM_QUERY_START':
      return true
    case 'OSM_QUERY_SUCCESS':
      return false
    case 'OSM_QUERY_FAILED':
      return false
    default:
      return state
  }
}
