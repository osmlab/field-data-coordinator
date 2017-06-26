'use strict'
const { Map } = require('immutable')
const initialState = Map({
  bounds: [],
  loading: false,
  error: null
})
module.exports = function (state = initialState, action) {
  switch (action.type) {
    case 'OSM_QUERY_START':
      return state.set('bounds', action.bounds).set('loading', true)
    case 'OSM_QUERY_SUCCESS':
      return state.set('loading', false).set('error', null)
    case 'OSM_QUERY_FAILED':
      return state.set('loading', false).set('error', action.error)
    default:
      return state
  }
}
