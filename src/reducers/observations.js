'use strict'
const { Map, List } = require('immutable')

const initialState = Map({
  // Immutable list of active (aka filtered) observation id's.
  active: List(),

  // Immutable list of all observation id's contained in the osm p2p db.
  all: List(),

  // Immutable list of property keys, used to filter 'active' observations
  // from all observations.
  filterProperties: List(),

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
    for (let i = 0; i < filters.length; ++i) {
      if (!properties.hasOwnProperty(filters[i])) {
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
    let { property } = action
    let currentProperties = state.get('filterProperties')
    let indexOfProperty = currentProperties.indexOf(property)
    let newProperties = (indexOfProperty === -1)
      ? currentProperties.push(property) : currentProperties.remove(indexOfProperty)
    return state
    .set('filterProperties', newProperties)
    .set('active', activeObservations(state.get('_map'), newProperties))
  } else return state
}

module.exports.getActiveFeatures = function (state) {
  const all = state.get('_map')
  const activeFeatures = []
  state.get('active').forEach(id => activeFeatures.push(all[id]))
  return {
    type: 'FeatureCollection',
    features: activeFeatures
  }
}

module.exports.getPropertiesList = function (state) {
  const _map = state.get('_map')
  const result = {}
  state.get('all').forEach(id => {
    let { properties } = _map[id]
    for (let key in properties) {
      result[key] = result[key] ? result[key] + 1 : 1
    }
  })
  return result
}
