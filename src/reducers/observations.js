'use strict'
const { Map, List } = require('immutable')

function newObservationMap (observations) {
  const map = {}
  observations.forEach(obs => {
    map[obs.id] = obs
  })
  return map
}

function activeObservations (observations, filter) {
  const activeIds = observations.filter(filter).map(ob => ob.id)
  return List(activeIds)
}

const initialState = Map({
  active: List(),
  filter: () => true,

  // An non-immutable object containing normal geojson objects.
  // Note this should never be used in a react component.
  // Use a helper like `getActiveFeatures` instead.
  _map: Map()
})

module.exports.default = function (state = initialState, action) {
  switch (action.type) {
    case 'SYNC_SUCCESS':
      return state
        .set('_map', newObservationMap(action.observations))
        .set('active', activeObservations(action.observations, state.get('filter')))
    default:
      return state
  }
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
