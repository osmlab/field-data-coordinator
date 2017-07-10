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

function activeObservations (_map, filterProperties) {
  const filterFn = createFilter(filterProperties)
  const activeIds = Object.keys(_map).filter(key => filterFn(_map[key]))
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
    .set('active', activeObservations(_map, state.get('filterProperties')))
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
    .set('active', activeObservations(state.get('_map'), newProperties))

  /*
   * Filter to only one active observation
   */
  } else if (action.type === 'SET_ACTIVE_OBSERVATION') {
    let filter = Map({ id: action.observationId })
    return state.set('filterProperties', filter)
    .set('active', activeObservations(state.get('_map'), filter))

  /*
   * Clear all filter properties
   */
  } else if (action.type === 'CLEAR_FILTER_PROPERTIES') {
    let emptyProperties = Map()
    return state.set('filterProperties', emptyProperties)
    .set('active', activeObservations(state.get('_map'), emptyProperties))

  /* default */
  } else return state
}
