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

module.exports.default = function (state = initialState, action) {
  if (action.type === 'SYNC_SUCCESS') {
    let _map = newObservationMap(action.observations)
    return state
    .set('_map', _map)
    .set('active', activeObservations(_map, state.get('filterProperties')))
    .set('all', List(Object.keys(_map)))
  } else if (action.type === 'TOGGLE_FILTER_PROPERTY') {
    let { k, v } = action.property
    let filterProperties = state.get('filterProperties')
    let newProperties = filterProperties.has(k)
      ? filterProperties.delete(k) : filterProperties.set(k, v)
    return state
    .set('filterProperties', newProperties)
    .set('active', activeObservations(state.get('_map'), newProperties))
  } else return state
}

/*
 * Get a FeatureCollection of all active Observations
 */
module.exports.getActiveFeatures = function (state) {
  const all = state.get('_map')
  const activeFeatures = []
  state.get('active').forEach(id => activeFeatures.push(all[id]))
  return {
    type: 'FeatureCollection',
    features: activeFeatures
  }
}

/*
 * Get a flattened, non-immutable map of Observation properties
 * eg.
 * {
 *  propertyName: {
 *    response1: response1_count,
 *    response2: response2_count
 *  }
 * }
 */
module.exports.getFlattenedProperties = function (state) {
  const _map = state.get('_map')
  const flattened = {}
  state.get('all').forEach(id => {
    let { properties } = _map[id]
    for (let propertyName in properties) {
      let response = properties[propertyName]
      flattened[propertyName] = flattened[propertyName] || {}
      let count = flattened[propertyName][response]
        ? flattened[propertyName][response] + 1 : 1
      flattened[propertyName][response] = count
    }
  })
  return flattened
}
