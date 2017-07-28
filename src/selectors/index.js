'use strict'

module.exports.getSurveys = state => state.surveys

/*
 * Get a FeatureCollection of all active Observations
 */
module.exports.getActiveFeatures = function (state) {
  const all = state.observations.get('_map')
  const activeFeatures = []
  state.observations.get('active').forEach(id => activeFeatures.push(all[id]))
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
  const _map = state.observations.get('_map')
  const flattened = {}
  state.observations.get('all').forEach(id => {
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

module.exports.getRecentObservations = function (sliceIndex) {
  return function (state) {
    const _map = state.observations.get('_map')
    const observations = []
    const ids = state.sequentialObservations.slice(0, sliceIndex).forEach(id => {
      observations.push(_map[+id])
    })
    return observations
  }
}
