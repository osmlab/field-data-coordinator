'use strict'
const { Map, List } = require('immutable')

const initialState = Map({
  // Immutable list of active (aka filtered) observation id's.
  active: List(),

  // Immutable list of all observation id's contained in the osm p2p db.
  all: List(),

  // Immutable map of property keys and values,
  // used to filter 'active' observations from all observations.
  filterProperties: Map(),

  // Immutable list containing two values, representing
  // start (0 index) and end date (1 index)
  dateRange: List(),

  // An non-immutable object of normal geojson objects mapped to id.
  // Note this should never be used in a react component.
  // Use a helper like `getActiveFeatures` instead.
  _map: {}
})

function newObservationMap (observations) {
  const map = {}
  observations.forEach(obs => {
    map[obs.id] = obs
  })
  return map
}

function createFilter (filterProperties) {
  if (!filterProperties.size) return () => true
  const filters = filterProperties.toJS()
  return ({properties}) => {
    for (let name in filters) {
      if (!properties.hasOwnProperty(name) || properties[name] !== filters[name]) {
        return false
      }
    }
    return true
  }
}

function createDateFilter (dateRange) {
  if (!dateRange.size) return () => true
  return ({properties}) => {
    let timestamp = parseInt(properties._timestamp, 10)
    return dateRange.first() <= timestamp && timestamp <= dateRange.last()
  }
}

function activeObservations (_map, filterProperties, dateRange) {
  const filterFn = createFilter(filterProperties)
  const timeRangeFilterFn = createDateFilter(dateRange)
  const activeIds = Object.keys(_map).filter(key => filterFn(_map[key]) && timeRangeFilterFn(_map[key]))
  return List(activeIds)
}

module.exports = function (state = initialState, action) {
  /*
   * On sync, replace the internal data representation
   * and update the currently active observations,
   * as well as the all-inclusive List of id's
   */
  if (action.type === 'SYNC_SUCCESS') {
    let _map = newObservationMap(action.observations)
    return state
    .set('_map', _map)
    .set('active', activeObservations(_map, state.get('filterProperties'), state.get('dateRange')))
    .set('all', List(Object.keys(_map)))

  /*
   * Update the filterProperties Map with the given key/value.
   */
  } else if (action.type === 'TOGGLE_FILTER_PROPERTY') {
    let { k, v } = action.property
    let filterProperties = state.get('filterProperties')
    let existingFilter = filterProperties.get(k)
    let newProperties
    if (typeof existingFilter === 'undefined' || existingFilter !== v) {
      newProperties = filterProperties.set(k, v)
    } else {
      newProperties = filterProperties.delete(k)
    }
    return state
    .set('filterProperties', newProperties)
    .set('active', activeObservations(state.get('_map'), newProperties, state.get('dateRange')))

  /*
   * Filter to only one active observation
   */
  } else if (action.type === 'SET_ACTIVE_OBSERVATION') {
    let filter = Map({ id: action.observationId })
    return state.set('filterProperties', filter)
    .set('active', activeObservations(state.get('_map'), filter, state.get('dateRange')))

  /*
   * Clear all filter properties
   */
  } else if (action.type === 'CLEAR_FILTER_PROPERTIES') {
    let emptyProperties = Map()
    let emptyDateRange = List()
    return state.set('filterProperties', emptyProperties)
    .set('dateRange', emptyDateRange)
    .set('active', activeObservations(state.get('_map'), emptyProperties, emptyDateRange))

  /*
   * Set a time range filter
   */
  } else if (action.type === 'SET_OBSERVATION_TIME_RANGE') {
    let newDateRange = List(action.range)
    return state.set('dateRange', newDateRange)
    .set('active', activeObservations(state.get('_map'), state.get('filterProperties'), newDateRange))

  /* default */
  } else return state
}
