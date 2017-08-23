const source = 'ACTIVE_OBSERVATIONS'
module.exports.SOURCE = source
module.exports.markerStyle = {
  id: 'observations',
  type: 'circle',
  source,
  paint: {
    'circle-radius': 7,
    'circle-color': '#555555'
  },
  filter: ['==', '$type', 'Point']
}
