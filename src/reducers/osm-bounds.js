'use strict'
const initialState = []
module.exports = function (state = initialState, { type, bounds }) {
  switch (type) {
    case 'OSM_QUERY_SUCCESS':
      return bounds
    default:
      return state
  }
}
